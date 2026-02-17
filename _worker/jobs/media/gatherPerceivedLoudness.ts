import { Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";
import ffmpeg from "fluent-ffmpeg";
import path from "node:path";

const mediaRoot = "./media";

const TARGET_I = -18; // LUFS
const TARGET_TP = -1.5; // dBTP
const TARGET_LRA = 11;

const MIN_PERCENT = 0;
const MAX_PERCENT = 200;

export const execute = async (job: Job) => {
  let mediaId: string | null = null;

  try {
    const parsed = await parseAndValidate(job);
    mediaId = parsed.id;

    const filePath = path.join(mediaRoot, parsed.id);

    const loudnormJson = await analyzeLoudnorm(filePath);
    const suggestion = computeSuggestedVolumeFromLoudnorm(loudnormJson);

    await prisma.media.update({
      where: { id: parsed.id },
      data: { suggestedVolumePercent: suggestion.suggestedVolumePercent },
    });

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "completed",
        debugMessages: [
          "Gathered perceived loudness",
          JSON.stringify({
            mediaId,
            filePath,
            suggestedVolumePercent: suggestion.suggestedVolumePercent,
            suggestedMultiplier: suggestion.suggestedMultiplier,
            clampPercent: { min: MIN_PERCENT, max: MAX_PERCENT },
            targets: { I: TARGET_I, TP: TARGET_TP, LRA: TARGET_LRA },
            parsed: suggestion.parsed,
            raw: loudnormJson,
          }),
        ],
      },
    });
  } catch (err: any) {
    await failJob(job.id, "Could not gather perceived loudness", err, {
      mediaId,
    });
    throw err;
  }
};

const parseAndValidate = async (job: Job): Promise<{ id: string }> => {
  let json: any;
  try {
    json = JSON.parse(job.data);
  } catch (err: any) {
    throw new Error(
      `Invalid job data (JSON parse failed): ${err?.message ?? String(err)}`,
    );
  }

  const id = json?.id;
  if (!id || typeof id !== "string") {
    throw new Error("Invalid job data (missing id)");
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    throw new Error(`No media with given id: ${id}`);
  }

  if (typeof media.type !== "string" || !media.type.startsWith("video")) {
    throw new Error(`Can only process videos but got type: ${media.type}`);
  }

  return { id };
};

const analyzeLoudnorm = async (filePath: string): Promise<any> => {
  let stderrData = "";

  await new Promise<void>((resolve, reject) => {
    ffmpeg(filePath)
      .noVideo()
      .audioFilters(
        `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}:print_format=json`,
      )
      .output("-")
      .outputOptions(["-f", "null"])
      .on("stderr", (chunk: string) => {
        stderrData += chunk;
      })
      .on("error", reject)
      .on("end", resolve)
      .run();
  });

  const jsonCandidates = extractJsonObjects(stderrData);

  // Pick the last candidate that looks like loudnorm output
  const loudnormCandidate =
    [...jsonCandidates]
      .reverse()
      .map((s) => {
        try {
          return JSON.parse(s);
        } catch {
          return null;
        }
      })
      .find(
        (obj) =>
          obj &&
          typeof obj === "object" &&
          ("offset" in obj ||
            "input_i" in obj ||
            "input_tp" in obj ||
            "measured_I" in obj ||
            "measured_TP" in obj),
      ) ?? null;

  if (!loudnormCandidate) {
    // Include tail for debugging; don’t store the whole stderr in DB
    const tail = stderrData.slice(-4000);
    throw new Error(
      "Loudness data not found in FFmpeg output. Tail stderr:\n" + tail,
    );
  }

  return loudnormCandidate;
};

const computeSuggestedVolumeFromLoudnorm = (
  raw: any,
): {
  suggestedVolumePercent: number;
  suggestedMultiplier: number;
  parsed: {
    inputI: number | null;
    inputTP: number | null;
    measuredI: number | null;
    measuredTP: number | null;
    offsetDb: number | null;
  };
} => {
  const readNum = (...keys: string[]) => {
    for (const k of keys) {
      const v = raw?.[k];
      if (v === undefined || v === null) continue;
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return null;
  };

  const inputI = readNum("input_i", "input_I");
  const inputTP = readNum("input_tp", "input_TP");
  const measuredI = readNum("measured_I", "measured_i");
  const measuredTP = readNum("measured_TP", "measured_tp");
  const offsetDb = readNum("offset");

  let multiplier: number;

  if (offsetDb !== null) {
    // Best: use loudnorm’s own computed offset gain
    multiplier = Math.pow(10, offsetDb / 20);
  } else {
    // Fallback heuristic (if offset not present for some reason)
    const effectiveI = measuredI ?? inputI;
    const effectiveTP = measuredTP ?? inputTP;

    multiplier = 1.0;

    if (effectiveI !== null) {
      const diffDb = TARGET_I - effectiveI;
      multiplier = Math.pow(10, diffDb / 20);
    }

    if (effectiveTP !== null) {
      const tpDiffDb = TARGET_TP - effectiveTP;
      const tpCap = Math.pow(10, tpDiffDb / 20);
      multiplier = Math.min(multiplier, tpCap);
    }

    multiplier = Math.max(0, multiplier);
  }

  // UI rule: 100% == unity multiplier (average), 200% max
  let percent = Math.round(multiplier * 100);
  percent = clamp(percent, MIN_PERCENT, MAX_PERCENT);

  // reflect the clamped suggestion
  const clampedMultiplier = percent / 100;

  return {
    suggestedVolumePercent: percent,
    suggestedMultiplier: clampedMultiplier,
    parsed: { inputI, inputTP, measuredI, measuredTP, offsetDb },
  };
};

const failJob = async (
  jobId: number,
  message: string,
  err?: any,
  extra?: any,
) => {
  const details =
    err == null
      ? undefined
      : typeof err === "string"
        ? err
        : err?.message
          ? err.message
          : JSON.stringify(err);

  const extraStr =
    extra == null
      ? undefined
      : (() => {
          try {
            return JSON.stringify(extra);
          } catch {
            return String(extra);
          }
        })();

  const debugMessages = [
    message,
    ...(details ? [details] : []),
    ...(extraStr ? [extraStr] : []),
  ];

  await prisma.job.update({
    where: { id: jobId },
    data: { status: "failed", debugMessages },
  });
};

/**
 * Extract JSON objects from a string by scanning braces while respecting strings.
 * Returns raw JSON substrings.
 */
const extractJsonObjects = (input: string): string[] => {
  const results: string[] = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];

    if (inString) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    } else {
      if (c === '"') {
        inString = true;
        continue;
      }
    }

    if (c === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (c === "}") {
      if (depth > 0) depth--;
      if (depth === 0 && start !== -1) {
        results.push(input.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return results;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

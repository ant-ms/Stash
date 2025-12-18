import { Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";

const mediaRoot = "./media";
import ffmpeg from "fluent-ffmpeg";

export const execute = async (job: Job) => {
  let stderrData = "";

  const { id } = await parse(job.data, job);

  await new Promise((resolve, reject) => {
    try {
      ffmpeg(`${mediaRoot}/${id}`)
        .audioFilters("loudnorm=I=-18:TP=-1.5:LRA=11:print_format=json")
        .format("null")
        .output("-")
        .on("stderr", (stderrLine) => {
          stderrData += stderrLine;
        })
        .on("error", async (error) => {
          await prisma.job.update({
            where: { id: job.id },
            data: {
              status: "failed",
              debugMessages: [
                "Could not gather preceived loudness",
                error.message,
              ],
            },
          });
          reject(error);
        })
        .on("end", async () => {
          const jsonStart = stderrData.indexOf("{");
          const jsonEnd = stderrData.lastIndexOf("}");
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonString = stderrData.substring(jsonStart, jsonEnd + 1);
            try {
              const loudnessData = JSON.parse(jsonString);

              const inputI = Number(loudnessData.input_i);
              const inputTP = Number(loudnessData.input_tp);
              const targetI = -18; // Integrated loudness target (same as loudnorm I=-18)
              const targetTP = -1.5; // True peak target (same as loudnorm TP=-1.5)

              let suggestedMultiplier = 1.0;
              if (Number.isFinite(inputI)) {
                const diff = targetI - inputI;
                suggestedMultiplier = Math.pow(10, diff / 20);
              }

              // Apply true-peak capping to prevent clipping
              if (Number.isFinite(inputTP)) {
                const tpDiff = targetTP - inputTP;
                const tpCap = Math.pow(10, tpDiff / 20);
                suggestedMultiplier = Math.min(suggestedMultiplier, tpCap);
              }

              // Clamp multiplier to reasonable range (e.g., max +12 dB gain)
              suggestedMultiplier = Math.max(
                0.0,
                Math.min(suggestedMultiplier, 4.0),
              );

              const suggestedVolumePercent = Math.round(
                50 * suggestedMultiplier,
              );

              await prisma.media.update({
                where: { id },
                data: {
                  suggestedVolumePercent,
                },
              });

              await prisma.job.update({
                where: { id: job.id },
                data: {
                  status: "completed",
                  debugMessages: [
                    "Gathered perceived loudness",
                    JSON.stringify({
                      suggestedVolumePercent,
                      suggestedVolumeMultiplier: suggestedMultiplier,
                      targetLUFS: targetI,
                      inputLUFS: Number.isFinite(inputI) ? inputI : null,
                      targetTruePeak: targetTP,
                      inputTruePeak: Number.isFinite(inputTP) ? inputTP : null,
                      loudnessData,
                    }),
                  ],
                },
              });
            } catch (err: any) {
              await prisma.job.update({
                where: { id: job.id },
                data: {
                  status: "failed",
                  debugMessages: [
                    "Failed to parse loudness data: " +
                      (err?.message ?? String(err)),
                  ],
                },
              });
              reject(err);
              return;
            }
          } else {
            await prisma.job.update({
              where: { id: job.id },
              data: {
                status: "failed",
                debugMessages: ["Loudness data not found in FFmpeg output."],
              },
            });
            reject(new Error("Loudness data not found in FFmpeg output."));
            return;
          }
          resolve(null);
        })
        .run();
    } catch (error: any) {
      reject(error);
    }
  });
};

const parse = async (
  data: any,
  job: Job,
): Promise<{
  id: string;
}> => {
  const json = JSON.parse(data);

  // TODO: Reduce duplication
  if (!json.id) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["Invalid job data"] },
    });
    throw new Error();
  }

  // TODO: Reduce duplication
  const media = await prisma.media.findFirst({ where: { id: json.id } });

  // TODO: Reduce duplication
  if (!media) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["No media with given id"] },
    });
    throw new Error();
  }

  // TODO: Reduce duplication
  if (!media.type.startsWith("video")) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        debugMessages: ["Can only process videos but got " + media.type],
      },
    });
    throw new Error();
  }

  return json;
};

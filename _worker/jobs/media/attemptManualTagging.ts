import { Job, Media } from "../../src/generated/prisma/client";
import prisma from "../../prisma";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";
import fs from "fs/promises";

const MEDIA_ROOT = "./media";

const getSpecialFilterAttributeFromNumber = (number: number) => {
  if (number === 1) {
    return "solo";
  } else if (number === 2) {
    return "two";
  } else if (number === 3) {
    return "three";
  } else if (number >= 4) {
    return "group";
  }
  return "unknown";
};

export const execute = async (job: Job) => {
  const { media } = await parse(job.data, job);

  const allTagsForCluster = await prisma.tags.findMany({
    where: {
      clusters: { some: { id: media.clustersId } },
      description: {
        not: null,
      },
    },
  });

  const prompt = `
      You are a helpful assistant that extracts data from images.

      You can use these tags:
      ${allTagsForCluster
        .map((tag) => `- ${tag.tag} (${tag.description})`)
        .join("\n")}
  `;

  await prisma.job.update({
    where: { id: job.id },
    data: {
      debugMessages: [`Using prompt: ${prompt}`],
    },
  });

  const modelToUse = process.env.VISUAL_AI_MODEL;
  if (!modelToUse) throw "Variable VISUAL_AI_MODEL is not set";

  const { object } = await generateObject({
    model: openrouter(modelToUse),
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract relavant data from the included image. Only use tags that you have been given and only return the tags of which you are at least 30% certain that they are actually applicable.",
          },
          {
            type: "image",
            image: await fs.readFile(`${MEDIA_ROOT}/${media.id}`),
          },
        ],
      },
    ],
    schema: z.object({
      numberOfPeopleInImage: z
        .number()
        .int()
        .describe("The number of people in the image."),
      tags: z
        .array(z.string())
        .describe("A list of tags associated with the image."),
    }),
  });

  await prisma.job.update({
    where: { id: job.id },
    data: {
      debugMessages: {
        push: `Completed with data: ${JSON.stringify(object)}`,
      },
    },
  });

  await prisma.media.update({
    where: { id: media.id },
    data: {
      specialFilterAttributeGuess: getSpecialFilterAttributeFromNumber(
        object.numberOfPeopleInImage,
      ),
      tagsGuess: object.tags,
      visualAiMatchingVersion: 1,
    },
  });
};

const parse = async (
  data: any,
  job: Job,
): Promise<{
  media: Media;
}> => {
  const json = JSON.parse(data);

  if (!json.id) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["Invalid job data"] },
    });
    throw new Error();
  }

  const media = await prisma.media.findFirst({ where: { id: json.id } });

  if (!media) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["No media with given id"] },
    });
    throw new Error();
  }

  if (!media.type.startsWith("image")) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        debugMessages: ["Can only process images but got " + media.type],
      },
    });
    throw new Error();
  }

  return {
    media,
  };
};

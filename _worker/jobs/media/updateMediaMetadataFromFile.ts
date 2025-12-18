import { Job } from "../../src/generated/prisma/client";
import prisma from "../../prisma";
import getMetadataFromFile from "../../lib/getMetadataFromFile";
import type { MetadataType } from "../../lib/getMetadataFromFile.types";
import fs from "fs/promises";

export const updateMediaMetadataOfFile = async (
  id: string,
  initial = false,
) => {
  const metadata = await getMetadataFromFile(`./media/${id}`);
  const fileSize = await fs.stat(`./media/${id}`).then((stats) => stats.size);

  if (initial)
    await prisma.media.update({
      where: { id },
      data: {
        width: metadata.width,
        height: metadata.height,
        sizeBytes: fileSize,
        createdDate: await getCreatedDate(id, metadata),
      },
    });
  else
    await prisma.media.update({
      where: { id },
      data: {
        width: metadata.width,
        height: metadata.height,
        sizeBytes: fileSize,
      },
    });
};

export const execute = async (job: Job) => {
  const { id, initial } = await parse(job.data, job);
  await updateMediaMetadataOfFile(id, initial);
};

const parse = async (
  data: any,
  job: Job,
): Promise<{ id: string; initial: boolean | undefined }> => {
  const json = JSON.parse(data);

  if (!json.id) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["Invalid job data"] },
    });
    throw new Error();
  }

  if (!(await prisma.media.findFirst({ where: { id: json.id } }))) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["No media with given id"] },
    });
    throw new Error();
  }

  return json;
};

const getCreatedDate = async (id: string, metadata: MetadataType) => {
  const convertToDate = (input: string): Date | false => {
    if (!input) return false;
    const date = new Date(input.replace(/:/g, "-").replace(" ", "T"));
    return date > new Date(0) ? date : false;
  };

  const { name } = await prisma.media.findUniqueOrThrow({ where: { id } });

  const createdDateMatchFromFilename = name.match(
    /(20\d\d)-?([01]\d)-?([0123]\d)/,
  );

  return (
    convertToDate(metadata.CreateDate) ||
    (createdDateMatchFromFilename
      ? new Date(
          `${createdDateMatchFromFilename[1]}-${createdDateMatchFromFilename[2]}-${createdDateMatchFromFilename[3]}`,
        )
      : convertToDate(metadata.FileModifyDate) || new Date(0))
  );
};

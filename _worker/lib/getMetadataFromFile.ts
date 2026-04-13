import { execSync } from "child_process";
import { realpath } from "fs/promises";
import type { MetadataType } from "./getMetadataFromFile.types";

export default async (filename: string) => {
  const absolutePath = await realpath(filename);
  const metadata = JSON.parse(
    execSync(`exiftool -api LargeFileSupport=1 -j "${absolutePath}"`).toString()
  )[0] as MetadataType;

  const height = parseInt((metadata as any)["ImageHeight"], 10);
  const width = parseInt((metadata as any)["ImageWidth"], 10);

  metadata.height = [90, 270, -90, -270].includes(metadata.Rotation)
    ? width
    : height;
  metadata.width = [90, 270, -90, -270].includes(metadata.Rotation)
    ? height
    : width;

  metadata.duration = getDuration(metadata);

  return metadata;
};

const getDuration = (metadata: MetadataType) => {
  if (!metadata.Duration) {
    return -1;
  }

  const parts = metadata.Duration.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;

  return hours * 3600 + minutes * 60 + seconds;
};
import prisma from "./prisma";
import { readdirSync } from "fs";
import { join, extname } from "path";

import { Job, JobStatus } from "./src/generated/prisma/client";

const registeredJobs = await importAllTsFiles();

console.log("Started...");

while (true) {
  const blockingNames = (
    await prisma.job.findMany({
      where: {
        status: {
          in: [JobStatus.created, JobStatus.running],
        },
      },
      select: {
        name: true,
      },
    })
  ).map((job) => job.name);

  const openJobs = await prisma.job.findMany({
    where: {
      status: "created",
      OR: [{ waitFor: null }, { waitFor: { notIn: blockingNames } }],
    },
    orderBy: {
      priority: "desc",
    },
  });

  for (const job of openJobs) {
    for (const registeredJob of registeredJobs) {
      if (job.name === registeredJob.name) {
        console.log(`Running job: ${job.name}`);
        await prisma.job.update({
          where: {
            id: job.id,
          },
          data: {
            status: "running",
          },
        });
        try {
          await registeredJob
            .execute(job)
            .then(async () => {
              await prisma.job.update({
                where: {
                  id: job.id,
                },
                data: {
                  status: "completed",
                },
              });
            })
            .catch(async (error: Error) => {
              console.trace(error.message, error.stack);
              await prisma.job.update({
                where: {
                  id: job.id,
                },
                data: {
                  status: "failed",
                  debugMessages: {
                    push: [error.message],
                  },
                },
              });
            });
        } catch (error: any) {
          await prisma.job.update({
            where: {
              id: job.id,
            },
            data: {
              status: "failed",
              debugMessages: {
                push: [error.message],
              },
            },
          });
        }
      }
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

async function importAllTsFiles() {
  const directory = "./jobs/media";

  // Get all files in the directory
  const files = readdirSync(directory);

  // Initialize an array to hold the exports
  const exportsArray: {
    name: string;
    execute: (job: Job) => Promise<void>;
  }[] = [];

  // Loop through the files
  for (const file of files) {
    // Only process .ts files
    if (extname(file) === ".ts") {
      // Dynamically import the module
      const { execute } = await import(`./${join(directory, file)}`);

      // Add the exports to the array
      exportsArray.push({
        name: file.substring(0, file.length - 3),
        execute,
      });
    }
  }

  return exportsArray;
}

import prisma from "./prisma";
import { readdirSync } from "fs";
import { join, extname } from "path";
import { Cron } from "croner";

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

  await checkScheduledJobs();
}

async function checkScheduledJobs() {
  const scheduledJobs = await prisma.scheduledJob.findMany({
    where: { enabled: true },
  });

  const now = new Date();

  for (const scheduledJob of scheduledJobs) {
    const baseline = scheduledJob.lastRunAt ?? new Date(0);
    let nextRun: Date | null = null;
    try {
      nextRun = new Cron(scheduledJob.cronExpression).nextRun(baseline);
    } catch {
      console.error(`Invalid cron expression for ${scheduledJob.name}: ${scheduledJob.cronExpression}`);
      continue;
    }

    if (!nextRun || nextRun > now) continue;

    // Only enqueue if no created/running job with this name exists
    const existing = await prisma.job.findFirst({
      where: {
        name: scheduledJob.name,
        status: { in: [JobStatus.created, JobStatus.running] },
      },
    });

    if (!existing) {
      console.log(`Scheduling job ${scheduledJob.name} (cron: ${scheduledJob.cronExpression})`);
      await prisma.job.create({
        data: { name: scheduledJob.name, data: "{}", priority: 0 },
      });
    }

    await prisma.scheduledJob.update({
      where: { id: scheduledJob.id },
      data: { lastRunAt: now },
    });
  }
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

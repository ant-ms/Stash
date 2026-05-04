/**
 * Seed script for integration tests.
 *
 * Creates:
 * - 2 clusters (cats, videos)
 * - 1 test user (testadmin / testpassword123)
 * - 3 tags (Animals, Cats, Dogs)
 * - 5 cat images (downloaded from cataas.com)
 * - 2 video media entries with importFromUrl jobs (Big Buck Bunny, Sintel)
 *
 * Requires DATABASE_URL to point to the test schema.
 * Requires MEDIA_ROOT (defaults to ../_frontend/media).
 */
import { PrismaClient } from "../_worker/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { bcrypt } from "hash-wasm";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const MEDIA_ROOT = process.env.MEDIA_ROOT ?? "../_frontend/media";
const THUMB_ROOT = process.env.THUMB_ROOT ?? "../_frontend/thumbnails";

// Fixed seed salt: exactly 16 ASCII chars so sign-in verification reproduces the same hash.
// Sign-in calls: bcrypt({ costFactor: 10, password, salt: storedSalt })
// where storedSalt is what we write to the DB here.
const SEED_SALT = "test_seed_salt00";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await mkdir(MEDIA_ROOT, { recursive: true });
  await mkdir(THUMB_ROOT, { recursive: true });

  // 1. Create clusters (upsert for idempotency)
  const catCluster = await prisma.clusters.upsert({
    where: { name: "cats" },
    update: {},
    create: { name: "cats", icon: "mdiCat", type: "normal", sortOrder: 0 },
  });
  console.log(`Cluster: cats (id=${catCluster.id})`);

  const videoCluster = await prisma.clusters.upsert({
    where: { name: "videos" },
    update: {},
    create: { name: "videos", icon: "mdiVideo", type: "normal", sortOrder: 0 },
  });
  console.log(`Cluster: videos (id=${videoCluster.id})`);

  // 2. Create test user (upsert)
  // Use the salt string directly — same as how the sign-in handler calls bcrypt({ salt: match.salt })
  const hash = await bcrypt({
    costFactor: 10,
    password: "testpassword123",
    salt: SEED_SALT,
  });

  await prisma.credentials.upsert({
    where: { username: "testadmin" },
    update: {},
    create: {
      username: "testadmin",
      hash,
      salt: SEED_SALT,
      permittedClusters: {
        connect: [{ id: catCluster.id }, { id: videoCluster.id }],
      },
    },
  });
  console.log("User: testadmin / testpassword123");

  // 3. Create tags
  const animalsTag = await prisma.tags.create({
    data: {
      tag: "Animals",
      clusters: { connect: { id: catCluster.id } },
    },
  });
  const catsTag = await prisma.tags.create({
    data: {
      tag: "Cats",
      parentId: animalsTag.id,
      clusters: { connect: { id: catCluster.id } },
    },
  });
  await prisma.tags.create({
    data: {
      tag: "Dogs",
      parentId: animalsTag.id,
      clusters: { connect: { id: catCluster.id } },
    },
  });
  console.log("Tags: Animals, Cats, Dogs");

  // 4. Download 5 cat images
  for (let i = 0; i < 5; i++) {
    const id = randomUUID();
    const res = await fetch("https://cataas.com/cat");
    if (!res.ok) throw new Error(`cataas.com failed: ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(`${MEDIA_ROOT}/${id}`, buf);
    // Create a thumbnail copy so /thumb/{id}.webp resolves during tests
    await writeFile(`${THUMB_ROOT}/${id}.webp`, buf);

    await prisma.media.create({
      data: {
        id,
        name: `cat-${i + 1}`,
        type: "image/jpeg",
        height: 400,
        width: 600,
        tags_old: [],
        cluster: { connect: { id: catCluster.id } },
        tags: { connect: [{ id: catsTag.id }] },
      },
    });
    console.log(`Downloaded cat image ${i + 1}/5 → ${MEDIA_ROOT}/${id}`);
  }

  // 5. Create video media entries + importFromUrl jobs
  const videos = [
    {
      name: "big-buck-bunny",
      url: "https://www.youtube.com/watch?v=YE7VzlLtp-4",
    },
    {
      name: "sintel-trailer",
      url: "https://www.youtube.com/watch?v=eRsGyueVLvQ",
    },
  ];

  for (const video of videos) {
    const id = randomUUID();

    await prisma.media.create({
      data: {
        id,
        name: video.name,
        type: "video/mp4",
        height: 0,
        width: 0,
        tags_old: [],
        cluster: { connect: { id: videoCluster.id } },
      },
    });

    await prisma.job.create({
      data: {
        name: "importFromUrl",
        data: JSON.stringify({ id, url: video.url }),
        priority: 20,
      },
    });

    console.log(`Queued importFromUrl job for ${video.name} (media id=${id})`);
  }

  console.log("\nSeed complete.");
  console.log("Test credentials: testadmin / testpassword123");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
}).finally(() => prisma.$disconnect());

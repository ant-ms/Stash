import prisma from "./prisma";

try {
  // Fetch all media records
  const mediaRecords = await prisma.media.findMany({
    include: {
      tags: true,
      cluster: true,
    },
  });

  // Process each media record
  for (const media of mediaRecords) {
    const { cluster, tags } = media;

    if (cluster && tags.length > 0) {
      // Link each tag to the cluster
      for (const tag of tags) {
        await prisma.tags.update({
          where: { id: tag.id },
          data: {
            clusters: {
              connect: { id: cluster.id },
            },
          },
        });
      }
    }
  }

} catch (error) {
  console.error("Error during migration:", error);
} finally {
  await prisma.$disconnect();
}

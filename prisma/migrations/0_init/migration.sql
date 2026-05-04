-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ClusterType" AS ENUM ('normal', 'collection', 'screenshots', 'stories', 'withName');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('created', 'running', 'completed', 'failed', 'invalid');

-- CreateTable
CREATE TABLE "Clusters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" "ClusterType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "icon" TEXT,
    "collapsed" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "parentId" INTEGER,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "tags_old" TEXT[],
    "source" TEXT,
    "content_hash" TEXT,
    "sizeBytes" BIGINT,
    "duration" INTEGER,
    "favourited" BOOLEAN NOT NULL DEFAULT false,
    "specialFilterAttribute" TEXT,
    "clustersId" INTEGER NOT NULL,
    "groupedIntoNamesId" INTEGER,
    "visualAiMatchingVersion" SMALLINT NOT NULL DEFAULT 0,
    "specialFilterAttributeGuess" TEXT,
    "tagsGuess" TEXT[],
    "suggestedVolumePercent" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupedIntoNames" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GroupedIntoNames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'Unknown',
    "clusterId" INTEGER NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credentials" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,

    CONSTRAINT "Credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "credentialsId" INTEGER NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'created',
    "data" TEXT NOT NULL DEFAULT '{}',
    "completionPercentage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "debugMessages" TEXT[],
    "waitFor" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingsKeyValuePairs" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SettingsKeyValuePairs_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "cronExpression" TEXT NOT NULL DEFAULT '0 * * * *',
    "lastRunAt" TIMESTAMP(3),

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomIcon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "svgData" TEXT NOT NULL,

    CONSTRAINT "CustomIcon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClustersToCredentials" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClustersToCredentials_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ClustersToTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ClustersToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TagToTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TagToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MediaToTags" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_MediaToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clusters_name_key" ON "Clusters"("name");

-- CreateIndex
CREATE INDEX "Clusters_name_idx" ON "Clusters"("name");

-- CreateIndex
CREATE INDEX "Media_id_clustersId_tags_old_idx" ON "Media"("id", "clustersId", "tags_old");

-- CreateIndex
CREATE UNIQUE INDEX "Credentials_username_key" ON "Credentials"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledJob_name_key" ON "ScheduledJob"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomIcon_name_key" ON "CustomIcon"("name");

-- CreateIndex
CREATE INDEX "_ClustersToCredentials_B_index" ON "_ClustersToCredentials"("B");

-- CreateIndex
CREATE INDEX "_ClustersToTags_B_index" ON "_ClustersToTags"("B");

-- CreateIndex
CREATE INDEX "_TagToTag_B_index" ON "_TagToTag"("B");

-- CreateIndex
CREATE INDEX "_MediaToTags_B_index" ON "_MediaToTags"("B");

-- AddForeignKey
ALTER TABLE "Tags" ADD CONSTRAINT "Tags_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_clustersId_fkey" FOREIGN KEY ("clustersId") REFERENCES "Clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_groupedIntoNamesId_fkey" FOREIGN KEY ("groupedIntoNamesId") REFERENCES "GroupedIntoNames"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_credentialsId_fkey" FOREIGN KEY ("credentialsId") REFERENCES "Credentials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClustersToCredentials" ADD CONSTRAINT "_ClustersToCredentials_A_fkey" FOREIGN KEY ("A") REFERENCES "Clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClustersToCredentials" ADD CONSTRAINT "_ClustersToCredentials_B_fkey" FOREIGN KEY ("B") REFERENCES "Credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClustersToTags" ADD CONSTRAINT "_ClustersToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Clusters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClustersToTags" ADD CONSTRAINT "_ClustersToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTag" ADD CONSTRAINT "_TagToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToTag" ADD CONSTRAINT "_TagToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToTags" ADD CONSTRAINT "_MediaToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToTags" ADD CONSTRAINT "_MediaToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

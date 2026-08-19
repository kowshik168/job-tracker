-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "noResponseAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "applications_lastActivityAt_idx" ON "applications"("lastActivityAt");

-- CreateIndex
CREATE INDEX "applications_noResponseAt_idx" ON "applications"("noResponseAt");

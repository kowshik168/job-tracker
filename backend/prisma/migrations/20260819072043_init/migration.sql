-- CreateEnum
CREATE TYPE "ResumeType" AS ENUM ('BACKEND_SDE', 'SRE_DEVOPS', 'GENERAL_SWE', 'OTHER');

-- CreateEnum
CREATE TYPE "Source" AS ENUM ('LINKEDIN', 'COMPANY_WEBSITE', 'REFERRAL', 'WELLFOUND', 'NAUKRI', 'INSTAHYRE', 'OTHER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'OA', 'RECRUITER_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "CurrentRound" AS ENUM ('NONE', 'OA', 'RECRUITER_SCREEN', 'TECHNICAL_ROUND_1', 'TECHNICAL_ROUND_2', 'SYSTEM_DESIGN', 'MANAGERIAL', 'HR', 'FINAL', 'OTHER');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "jobUrl" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL,
    "source" "Source",
    "referral" TEXT,
    "resumeType" "ResumeType" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "currentRound" "CurrentRound" NOT NULL DEFAULT 'NONE',
    "recruiterName" TEXT,
    "recruiterContact" TEXT,
    "followUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_appliedAt_idx" ON "applications"("appliedAt");

-- CreateIndex
CREATE INDEX "applications_followUpDate_idx" ON "applications"("followUpDate");

-- CreateIndex
CREATE INDEX "applications_company_idx" ON "applications"("company");

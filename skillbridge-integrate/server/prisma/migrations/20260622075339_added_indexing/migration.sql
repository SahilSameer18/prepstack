-- AlterTable
ALTER TABLE "TokenBlacklist" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 day';

-- CreateIndex
CREATE INDEX "BehavioralQuestion_interviewReportId_idx" ON "BehavioralQuestion"("interviewReportId");

-- CreateIndex
CREATE INDEX "InterviewReport_userId_idx" ON "InterviewReport"("userId");

-- CreateIndex
CREATE INDEX "PreparationPlan_interviewReportId_idx" ON "PreparationPlan"("interviewReportId");

-- CreateIndex
CREATE INDEX "SkillGap_interviewReportId_idx" ON "SkillGap"("interviewReportId");

-- CreateIndex
CREATE INDEX "TechnicalQuestion_interviewReportId_idx" ON "TechnicalQuestion"("interviewReportId");

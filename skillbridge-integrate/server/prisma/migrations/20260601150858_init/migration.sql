/*
  Warnings:

  - The `tasks` column on the `PreparationPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `severity` on the `SkillGap` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "PreparationPlan" DROP COLUMN "tasks",
ADD COLUMN     "tasks" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "SkillGap" DROP COLUMN "severity",
ADD COLUMN     "severity" "Severity" NOT NULL;

-- AlterTable
ALTER TABLE "TokenBlacklist" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '1 day';

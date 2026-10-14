-- AlterTable
ALTER TABLE "TokenBlacklist" ALTER COLUMN "expiresAt" SET DEFAULT NOW() + INTERVAL '1 day';

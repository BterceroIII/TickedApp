-- AlterTable
ALTER TABLE "users" ADD COLUMN     "confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "token" VARCHAR(6);

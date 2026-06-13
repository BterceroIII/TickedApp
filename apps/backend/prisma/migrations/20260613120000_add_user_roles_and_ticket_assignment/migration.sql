-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN "assignedToId" UUID;

-- CreateIndex
CREATE INDEX "tickets_assignedToId_idx" ON "tickets"("assignedToId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `title` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "title" VARCHAR(150) NOT NULL DEFAULT '',
ALTER COLUMN "description" DROP NOT NULL;

-- Remove default after existing rows are updated
ALTER TABLE "tickets" ALTER COLUMN "title" DROP DEFAULT;

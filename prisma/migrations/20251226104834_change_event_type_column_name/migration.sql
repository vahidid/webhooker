/*
  Warnings:

  - You are about to drop the column `eventKind` on the `Route` table. All the data in the column will be lost.
  - Added the required column `eventType` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Route" DROP COLUMN "eventKind",
ADD COLUMN     "eventType" TEXT NOT NULL;

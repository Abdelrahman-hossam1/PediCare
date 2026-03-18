/*
  Warnings:

  - Added the required column `type` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "type" TEXT;

-- Backfill existing rows (required because the table is not empty)
UPDATE "Appointment" SET "type" = 'Consultation' WHERE "type" IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE "Appointment" ALTER COLUMN "type" SET NOT NULL;

-- AlterTable
ALTER TABLE "Vaccine" ADD COLUMN     "manufacturer" TEXT;

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultPrice" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

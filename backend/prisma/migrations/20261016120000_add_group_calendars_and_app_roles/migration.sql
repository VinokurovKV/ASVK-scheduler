-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('GROUP_LEADER', 'OWNER');

-- DropForeignKey
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_ownerId_fkey";

-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "groupNumber" TEXT,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "appRoles" "AppRole"[] DEFAULT ARRAY[]::"AppRole"[];

-- CreateIndex
CREATE INDEX "Calendar_ownerId_type_idx" ON "Calendar"("ownerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_type_groupNumber_key" ON "Calendar"("type", "groupNumber");

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill one shared calendar for every existing student group.
INSERT INTO "Calendar" ("name", "type", "groupNumber", "createdAt", "updatedAt")
SELECT
  'Группа ' || "groupNumber",
  'GROUP'::"CalendarType",
  "groupNumber",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User"
WHERE "groupNumber" IS NOT NULL
GROUP BY "groupNumber"
ON CONFLICT ("type", "groupNumber") DO NOTHING;

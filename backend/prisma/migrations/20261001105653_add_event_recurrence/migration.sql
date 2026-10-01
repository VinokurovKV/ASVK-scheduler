-- CreateEnum
CREATE TYPE "RepeatInterval" AS ENUM ('NONE', 'WEEK', 'TWO_WEEKS', 'MONTH');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "repeatInterval" "RepeatInterval" NOT NULL DEFAULT 'NONE';

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('LECTURE', 'SEMINAR', 'WORK_MEETING', 'MEETING');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'MEETING';

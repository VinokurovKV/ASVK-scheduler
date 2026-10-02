-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BACHELOR_STUDENT', 'MASTER_STUDENT', 'POSTGRADUATE', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "groupNumber" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "role" "UserRole";

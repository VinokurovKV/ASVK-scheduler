-- AlterEnum
BEGIN;

CREATE TYPE "UserRole_new" AS ENUM ('STUDENT', 'POSTGRADUATE', 'EMPLOYEE');

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole_new"
USING (
  CASE
    WHEN "role"::text IN ('BACHELOR_STUDENT', 'MASTER_STUDENT') THEN 'STUDENT'
    ELSE "role"::text
  END
)::"UserRole_new";

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

DROP TYPE "public"."UserRole_old";

COMMIT;

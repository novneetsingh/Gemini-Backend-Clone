/*
  Warnings:

  - The `messages` column on the `Chatroom` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Chatroom" DROP COLUMN "messages",
ADD COLUMN     "messages" JSONB[] DEFAULT ARRAY[]::JSONB[];

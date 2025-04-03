/*
  Warnings:

  - You are about to drop the column `category` on the `Feedback` table. All the data in the column will be lost.
  - Added the required column `rating` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Feedback` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "category",
ADD COLUMN     "rating" INTEGER NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

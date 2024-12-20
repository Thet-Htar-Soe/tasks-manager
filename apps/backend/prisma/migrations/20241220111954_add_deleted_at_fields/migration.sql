/*
  Warnings:

  - The primary key for the `TaskCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TaskCard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TaskList` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TaskList` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `TaskCard` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `taskCardId` on the `TaskList` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "TaskCard" DROP CONSTRAINT "TaskCard_userId_fkey";

-- DropForeignKey
ALTER TABLE "TaskList" DROP CONSTRAINT "TaskList_taskCardId_fkey";

-- AlterTable
ALTER TABLE "TaskCard" DROP CONSTRAINT "TaskCard_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "TaskCard_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TaskList" DROP CONSTRAINT "TaskList_pkey",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "taskCardId",
ADD COLUMN     "taskCardId" INTEGER NOT NULL,
ADD CONSTRAINT "TaskList_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "TaskCard" ADD CONSTRAINT "TaskCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskList" ADD CONSTRAINT "TaskList_taskCardId_fkey" FOREIGN KEY ("taskCardId") REFERENCES "TaskCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

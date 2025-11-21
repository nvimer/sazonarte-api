/*
  Warnings:

  - You are about to drop the column `costumer_id` on the `daily_ticket_book_codes` table. All the data in the column will be lost.
  - You are about to drop the column `costumer_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `costumer_id` on the `ticket_books` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerId,date]` on the table `daily_ticket_book_codes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."daily_ticket_book_codes" DROP CONSTRAINT "daily_ticket_book_codes_costumer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_costumer_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ticket_books" DROP CONSTRAINT "ticket_books_costumer_id_fkey";

-- DropIndex
DROP INDEX "public"."daily_ticket_book_codes_costumer_id_date_key";

-- AlterTable
ALTER TABLE "daily_ticket_book_codes" DROP COLUMN "costumer_id",
ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "costumer_id",
ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "ticket_books" DROP COLUMN "costumer_id",
ADD COLUMN     "customerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "daily_ticket_book_codes_customerId_date_key" ON "daily_ticket_book_codes"("customerId", "date");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_books" ADD CONSTRAINT "ticket_books_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_ticket_book_codes" ADD CONSTRAINT "daily_ticket_book_codes_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

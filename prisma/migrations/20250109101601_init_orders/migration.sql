/*
  Warnings:

  - A unique constraint covering the columns `[productId]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Orders_order_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "Orders_productId_key" ON "Orders"("productId");

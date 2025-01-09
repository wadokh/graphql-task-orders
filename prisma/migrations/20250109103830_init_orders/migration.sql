/*
  Warnings:

  - A unique constraint covering the columns `[order_id,productId]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Orders_order_id_productId_key" ON "Orders"("order_id", "productId");

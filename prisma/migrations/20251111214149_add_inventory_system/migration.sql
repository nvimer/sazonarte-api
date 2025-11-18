-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "auto_mark_unavailable)" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "initial_stock" INTEGER,
ADD COLUMN     "inventory_type" TEXT NOT NULL DEFAULT 'UNLIMITED',
ADD COLUMN     "low_stock_alert" INTEGER DEFAULT 5,
ADD COLUMN     "stock_quantity" INTEGER;

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" TEXT NOT NULL,
    "menu_item_id" INTEGER NOT NULL,
    "adjustmentType" TEXT NOT NULL,
    "previous_stock" INTEGER NOT NULL,
    "new_stock" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

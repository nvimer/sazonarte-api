import { z } from "zod";

export const DailyStockResetItemSchema = z.object({
  itemId: z.number().positive(),
  quantity: z.number().min(0),
  lowStockAlert: z.number().min(1).optional(),
});

export const DailyStockResetRequestSchema = z.object({
  items: z.array(DailyStockResetItemSchema).min(1),
});

export const AddStockRequestSchema = z.object({
  quantity: z.number().positive(),
  reason: z.string().min(3),
});

export const RemoveStockRequestSchema = z.object({
  quantity: z.number().positive(),
  reason: z.string().min(3),
});

export const InventoryTypeRequestSchema = z.object({
  inventoryType: z.enum(["TRACKED", "UNLIMITED"]),
  lowStockAlert: z.number().min(1).optional(),
});

export const PaginationSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
});

export type DailyStockResetRequest = z.infer<
  typeof DailyStockResetRequestSchema
>;
export type AddStockRequest = z.infer<typeof AddStockRequestSchema>;
export type RemoveStockRequest = z.infer<typeof RemoveStockRequestSchema>;
export type InventoryTypeRequest = z.infer<typeof InventoryTypeRequestSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;

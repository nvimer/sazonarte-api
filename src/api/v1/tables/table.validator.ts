import { TableStatus } from "@prisma/client";
import { z } from "zod";

const tableStatus = z.enum(
  Object.values(TableStatus) as [TableStatus, ...TableStatus[]],
);

export const createTableSchema = z.object({
  body: z.object({
    number: z.string(),
    status: tableStatus.optional(),
    location: z.string().optional(),
  }),
});

export const updateTableSchema = z.object({
  body: z.object({
    number: z.string().optional(),
    status: tableStatus.optional(),
    location: z.string().optional(),
  }),
});

export const tableIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});

export const updateTableStatusSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
  body: z.object({
    status: tableStatus,
  }),
});

export type CreateTableInput = z.infer<typeof createTableSchema>["body"];
export type UpdateTableInput = z.infer<typeof updateTableSchema>["body"];

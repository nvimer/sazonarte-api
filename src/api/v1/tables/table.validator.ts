import { TableStatus } from "@prisma/client";
import { z } from "zod";

const tableStatus = z.enum(
  Object.values(TableStatus) as [TableStatus, ...TableStatus[]],
);

export const createTableSchema = z.object({
  body: z.object({
    number: z.number(),
    status: tableStatus,
    location: z.string().optional(),
  }),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;

import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z.string().max(50),
  description: z.string().max(255),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;

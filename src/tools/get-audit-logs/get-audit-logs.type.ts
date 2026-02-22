import { z } from 'zod';
import { PaginationSchema } from '../../schemas/base.schema.js';

export const GetAuditLogsSchema = z
  .object({
    limit: z.number().optional().default(10),
    action: z.string().optional(),
  })
  .merge(PaginationSchema);

export type GetAuditLogsArgs = z.infer<typeof GetAuditLogsSchema>;

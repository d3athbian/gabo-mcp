import { z } from "zod";

export const DeleteKnowledgeSchema = z
  .object({
    id: z.string().min(1, "ID is required"),
  })
  .merge(
    z.object({
      api_key: z.string().min(1, "API key is required").optional(),
    }),
  );

export type DeleteKnowledgeArgs = z.infer<typeof DeleteKnowledgeSchema>;

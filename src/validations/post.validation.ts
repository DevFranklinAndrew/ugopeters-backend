import { z } from "zod";
import AppError from "../errors/app.error";

/** Client-supplied fields only. `slug` and `readTime` are server-derived, so
 *  they are deliberately not accepted; `date` is, so uploads can be back-dated. */
const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  content: z.string().trim().min(1, "Content is required."),
  category: z.string().trim().min(1, "Category is required."),
  image: z.string().trim().min(1, "Image is required."),
  excerpt: z.string().trim().optional(),
  featured: z.boolean().optional(),
  // Free text, displayed verbatim; only parsed to derive the sortable publishedAt.
  date: z.string().trim().min(1, "Date cannot be empty.").optional(),
});

// Every field optional for a partial update, but reject an empty payload.
const updatePostSchema = createPostSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

const formatIssues = (error: z.ZodError): string =>
  error.issues.map((issue) => issue.message).join(". ");

export const validateCreatePost = (payload: unknown): CreatePostInput => {
  const result = createPostSchema.safeParse(payload);
  if (!result.success) throw new AppError(formatIssues(result.error), 422);
  return result.data;
};

export const validateUpdatePost = (payload: unknown): UpdatePostInput => {
  const result = updatePostSchema.safeParse(payload);
  if (!result.success) throw new AppError(formatIssues(result.error), 422);
  return result.data;
};

export { createPostSchema, updatePostSchema };

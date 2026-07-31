import { z } from "zod";
import AppError from "../errors/app.error";

/**
 * Client-supplied fields for a contact message. `read` and the timestamps are
 * server-owned, so they are NOT accepted here. `.max()` caps keep this public
 * endpoint from being used to store oversized blobs.
 */
const createMessageSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200, "Name is too long."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("A valid email is required.")
    .max(200, "Email is too long."),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required.")
    .max(200, "Reason is too long."),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .max(200, "Subject is too long."),
  message: z
    .string()
    .trim()
    .min(1, "Message is required.")
    .max(5000, "Message is too long."),
});

// `read` is the only admin-mutable field.
const updateMessageSchema = z.object({
  read: z.boolean(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;

const formatIssues = (error: z.ZodError): string =>
  error.issues.map((issue) => issue.message).join(". ");

/** Validate a create payload; zod failures become an operational AppError (422). */
export const validateCreateMessage = (payload: unknown): CreateMessageInput => {
  const result = createMessageSchema.safeParse(payload);
  if (!result.success) throw new AppError(formatIssues(result.error), 422);
  return result.data;
};

/** Validate a read-status update; zod failures become an AppError (422). */
export const validateUpdateMessage = (payload: unknown): UpdateMessageInput => {
  const result = updateMessageSchema.safeParse(payload);
  if (!result.success) throw new AppError(formatIssues(result.error), 422);
  return result.data;
};

export { createMessageSchema, updateMessageSchema };

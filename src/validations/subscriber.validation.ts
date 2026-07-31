import { z } from "zod";
import AppError from "../errors/app.error";

/** Client-supplied fields for a newsletter subscription (email only). */
const createSubscriberSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("A valid email is required.")
    .max(200, "Email is too long."),
});

export type CreateSubscriberInput = z.infer<typeof createSubscriberSchema>;

const formatIssues = (error: z.ZodError): string =>
  error.issues.map((issue) => issue.message).join(". ");

/** Validate a subscribe payload; zod failures become an operational AppError (422). */
export const validateCreateSubscriber = (
  payload: unknown,
): CreateSubscriberInput => {
  const result = createSubscriberSchema.safeParse(payload);
  if (!result.success) throw new AppError(formatIssues(result.error), 422);
  return result.data;
};

export { createSubscriberSchema };

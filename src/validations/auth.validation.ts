import { z } from "zod";
import AppError from "../errors/app.error";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required."),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

const validateLogin = (payload: unknown): LoginInput => {
  const result = loginSchema.safeParse(payload);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(". ");
    throw new AppError(message, 422);
  }
  return result.data;
};

export { loginSchema, validateLogin };

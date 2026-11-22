import { z } from "zod";

const email = z.string().email("Enter a valid email address");
const password = z.string().min(6, "Use at least 6 characters");

export const loginSchema = z.object({ email, password });

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Add your name"),
  email,
  password,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

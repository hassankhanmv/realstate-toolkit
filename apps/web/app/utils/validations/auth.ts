import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("validations.invalid_email"),
  password: z.string().min(6, "validations.password_min"),
});

export const signupSchema = z
  .object({
    email: z.string().email("validations.invalid_email"),
    full_name: z.string().min(2, "validations.full_name_min"),
    role: z.enum(["company_owner", "buyer"]),
    company_name: z.string().optional(),
    password: z.string().min(6, "validations.password_min"),
    confirmPassword: z.string().min(6, "validations.password_min"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "validations.passwords_mismatch",
        path: ["confirmPassword"],
      });
    }

    if (
      data.role === "company_owner" &&
      (!data.company_name || data.company_name.trim() === "")
    ) {
      ctx.addIssue({
        code: "custom",
        message: "validations.company_name_required",
        path: ["company_name"],
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

import { z } from "zod";

export const userPermissionsSchema = z.object({
  properties: z.object({
    view: z.boolean().default(false),
    edit: z.boolean().default(false),
    create: z.boolean().default(false),
    delete: z.boolean().default(false),
  }),
  leads: z.object({
    view: z.boolean().default(false),
    edit: z.boolean().default(false),
    create: z.boolean().default(false),
    delete: z.boolean().default(false),
  }),
  users: z.object({
    view: z.boolean().default(false),
    edit: z.boolean().default(false),
    create: z.boolean().default(false),
    delete: z.boolean().default(false),
  }),
  analytics: z.boolean().default(false),
  profile: z.boolean().default(false),
});

export const userNotificationsSchema = z.object({
  on_login: z.boolean().default(false),
  on_disable: z.boolean().default(true),
  on_expiry: z.boolean().default(true),
});

export const userFormSchema = z.object({
  full_name: z.string().min(2, "validations.full_name_min"),
  email: z.string().email("validations.invalid_email"),
  password: z
    .string()
    .min(6, "validations.password_min")
    .optional()
    .or(z.literal("")), // Optional for editing
  role: z.string().default("agent"),
  is_disabled: z.boolean().default(false),
  expiry_date: z.coerce.date().optional().nullable(),
  permissions: userPermissionsSchema,
  notifications: userNotificationsSchema,
});

export type UserFormValues = z.infer<typeof userFormSchema>;
export type UserPermissions = z.infer<typeof userPermissionsSchema>;
export type UserNotifications = z.infer<typeof userNotificationsSchema>;

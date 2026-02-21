import * as z from "zod";

// Export these so we can use them in the UI dropdowns instead of hardcoding them twice
export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Office",
  "Plot",
  "Commercial",
] as const;

export const PROPERTY_STATUSES = [
  "For Sale",
  "For Rent",
  "Off-Plan",
  "Ready",
] as const;

export const propertySchema = z.object({
  // Domain 1: The essentials
  basicInfo: z.object({
    title: z.string().min(3, { message: "properties.errors.title_min" }),
    price: z.number().min(1, { message: "properties.errors.invalid_price" }),
    location: z
      .string()
      .min(2, { message: "properties.errors.location_required" }),
    type: z.enum(PROPERTY_TYPES),
    status: z.enum(PROPERTY_STATUSES),
  }),

  // Domain 2: The physical attributes
  specifications: z.object({
    bedrooms: z.number().min(1),
    bathrooms: z.number().min(1),
    area: z.number().min(1),
    furnished: z.boolean().default(false),
  }),

  // Domain 3: Visibility and text content
  publishing: z.object({
    description: z
      .string({ message: "properties.errors.description_required" })
      .min(1, { message: "properties.errors.description_required" }),
    is_published: z.boolean().default(true),
    notes: z.string({ message: "properties.errors.notes_required" }).optional(),
  }),

  // Domain 4: Media
  media: z.object({
    urls: z.array(z.string()).default([]),
    media_urls: z.array(z.string()).default([]),
  }),

  // Domain 5: UAE / Off-Plan details (all optional)
  uae: z
    .object({
      handover_date: z.string().optional(),
      payment_plan: z.string().optional(),
      rera_id: z.string().optional(),
      roi_estimate: z.coerce.number().min(0).optional(),
    })
    .optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

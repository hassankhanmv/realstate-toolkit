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
    price: z.number().min(0, { message: "properties.errors.invalid_price" }),
    location: z
      .string()
      .min(2, { message: "properties.errors.location_required" }),
    type: z.enum(PROPERTY_TYPES),
    status: z.enum(PROPERTY_STATUSES),
  }),

  // Domain 2: The physical attributes
  specifications: z.object({
    bedrooms: z.number().min(0),
    bathrooms: z.number().min(0),
    area: z.number().min(0),
    furnished: z.boolean().default(false),
  }),

  // Domain 3: Visibility and text content
  publishing: z.object({
    description: z.string().optional(),
    is_published: z.boolean().default(true),
    notes: z.string().optional(),
  }),

  // 🚀 Future Expansion Ready:
  // media: z.object({ images: z.array(z.string()), videoTour: z.string().url().optional() }).optional(),
  // financial: z.object({ serviceCharge: z.number(), expectedRoi: z.number() }).optional(),
  // amenities: z.array(z.string()).optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

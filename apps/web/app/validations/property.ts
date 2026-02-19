import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  location: z.string().min(3, "Location is required"),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  area: z.coerce.number().positive("Area must be positive"),
  description: z.string().optional(),
  type: z.enum([
    "Apartment",
    "Villa",
    "Townhouse",
    "Office",
    "Plot",
    "Commercial",
  ]),
  status: z.enum(["For Sale", "For Rent", "Off-Plan", "Ready"]),
  furnished: z.boolean().default(false),
  amenities: z.array(z.string()).optional(),
  floor: z.coerce.number().optional(),
  year_built: z.coerce.number().optional(),
  notes: z.string().optional(),
  is_published: z.boolean().default(false),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

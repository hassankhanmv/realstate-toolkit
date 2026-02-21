import { faker } from "@faker-js/faker";

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Office",
  "Plot",
  "Commercial",
] as const;

const PROPERTY_STATUSES = [
  "For Sale",
  "For Rent",
  "Off-Plan",
  "Ready",
] as const;

const LOCATIONS = [
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "Jumeirah Village Circle",
  "Business Bay",
  "Dubai Hills Estate",
  "Arabian Ranches",
  "DIFC",
];

export function generateFakeProperties(count: number, userId: string) {
  return Array.from({ length: count }).map(() => {
    const type = faker.helpers.arrayElement(PROPERTY_TYPES);
    const isCommercial =
      type === "Office" || type === "Commercial" || type === "Plot";

    return {
      broker_id: userId,
      title: `${faker.word.adjective({ strategy: "any-length" })} ${type} in ${faker.helpers.arrayElement(LOCATIONS)}`,
      price: faker.number.int({ min: 500000, max: 15000000 }),
      location: faker.helpers.arrayElement(LOCATIONS),
      type,
      status: faker.helpers.arrayElement(PROPERTY_STATUSES),
      bedrooms: isCommercial ? 0 : faker.number.int({ min: 1, max: 6 }),
      bathrooms: isCommercial ? 0 : faker.number.int({ min: 1, max: 7 }),
      area: faker.number.int({ min: 400, max: 10000 }),
      furnished: faker.datatype.boolean(),
      description: faker.lorem.paragraphs(2),
      is_published: faker.datatype.boolean({ probability: 0.8 }),
      notes:
        faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.5,
        }) ?? null,
      images: [
        faker.image.urlLoremFlickr({ category: "realestate" }),
        faker.image.urlLoremFlickr({ category: "interior" }),
      ],
      created_at: faker.date.past({ years: 1 }).toISOString(),
    };
  });
}

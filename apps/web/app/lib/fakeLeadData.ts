import { faker } from "@faker-js/faker";

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Viewing",
  "Negotiation",
  "Won",
  "Lost",
] as const;

const LEAD_SOURCES = ["WhatsApp", "Website", "Referral", "Other"] as const;

const PROPERTY_IDS = [
  "111bed9b-62eb-4a92-aa5c-ff360e62a26f",
  "34d1dcb3-fd59-4cd2-ae80-517726ad3937",
  "3728f997-fcd5-40b1-ba0d-d4432ba919b6",
  "486ab4a1-5fe8-4168-9ed4-dada4e69cfcd",
  "65ad6c95-ea4d-434e-a1ab-bcff3752857f",
  "94481659-25a8-4167-b43e-28f2c5637c53",
];

export function generateFakeLeads(count: number, companyId: string) {
  return Array.from({ length: count }).map(() => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      company_id: companyId,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: `+9715${faker.string.numeric(8)}`,
      message:
        faker.helpers.maybe(() => faker.lorem.sentence({ min: 5, max: 20 }), {
          probability: 0.7,
        }) ?? null,
      status: faker.helpers.arrayElement(LEAD_STATUSES),
      source: faker.helpers.arrayElement(LEAD_SOURCES),
      property_id: faker.helpers.arrayElement(PROPERTY_IDS),
      notes:
        faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.4,
        }) ?? null,
      follow_up_date:
        faker.helpers.maybe(
          () => faker.date.soon({ days: 30 }).toISOString().split("T")[0],
          { probability: 0.5 },
        ) ?? null,
      created_at: faker.date.past({ years: 1 }).toISOString(),
    };
  });
}

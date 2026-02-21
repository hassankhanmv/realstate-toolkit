// Client
export { sendEmail, type SendEmailOptions } from "./client.js";

// Templates
export { baseTemplate, type BaseTemplateOptions } from "./templates/base.js";
export { getWelcomeEmail, type WelcomeEmailData } from "./templates/welcome.js";
export {
  getPropertyDeletedEmail,
  type PropertyDeletedEmailData,
} from "./templates/property-deleted.js";
export {
  getLeadCreatedEmail,
  type LeadCreatedEmailData,
} from "./templates/lead-created.js";

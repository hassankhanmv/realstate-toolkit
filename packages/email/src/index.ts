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
export {
  getLeadStatusChangeEmail,
  type LeadStatusChangeEmailData,
} from "./templates/lead-status-change.js";
export {
  getLeadDeletedEmail,
  type LeadDeletedEmailData,
} from "./templates/lead-deleted.js";
export {
  getFollowUpReminderEmail,
  type FollowUpReminderEmailData,
} from "./templates/follow-up-reminder.js";

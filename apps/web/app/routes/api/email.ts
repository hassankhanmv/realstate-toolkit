import { data, type ActionFunctionArgs } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import {
  sendEmail,
  getWelcomeEmail,
  getPropertyDeletedEmail,
  getLeadCreatedEmail,
  getLeadStatusChangeEmail,
  getLeadDeletedEmail,
  getFollowUpReminderEmail,
  getLoginNotificationEmail,
} from "@repo/email";

/**
 * Available built-in templates.
 * Each template function accepts a data object and returns { subject, html }.
 */
const TEMPLATES: Record<string, (d: any) => { subject: string; html: string }> =
  {
    welcome: getWelcomeEmail,
    "property-deleted": getPropertyDeletedEmail,
    "lead-created": getLeadCreatedEmail,
    "lead-status-change": getLeadStatusChangeEmail,
    "lead-deleted": getLeadDeletedEmail,
    "follow-up-reminder": getFollowUpReminderEmail,
    "login-notification": getLoginNotificationEmail,
  };

/**
 * POST /api/email
 *
 * Body (JSON):
 *   template: string    — one of the built-in template keys
 *   to: string          — recipient email address
 *   data: object        — template-specific data
 *
 * OR for raw emails:
 *   to: string
 *   subject: string
 *   html: string
 *
 * Requires authentication. Returns { success: true } on success.
 */
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const body = await request.json();
    let subject: string;
    let html: string;

    if (body.template) {
      const templateFn = TEMPLATES[body.template];
      if (!templateFn) {
        return data(
          {
            error: `Unknown template: ${body.template}. Available: ${Object.keys(TEMPLATES).join(", ")}`,
          },
          { status: 400, headers },
        );
      }
      const result = templateFn(body.data || {});
      subject = result.subject;
      html = result.html;
    } else if (body.subject && body.html) {
      subject = body.subject;
      html = body.html;
    } else {
      return data(
        { error: "Provide either 'template' + 'data', or 'subject' + 'html'." },
        { status: 400, headers },
      );
    }

    if (!body.to) {
      return data(
        { error: "'to' email address is required." },
        { status: 400, headers },
      );
    }

    await sendEmail({ to: body.to, subject, html });

    return data({ success: true }, { headers });
  } catch (error: any) {
    console.error("Email send failed:", error);
    return data(
      { error: error.message || "Failed to send email" },
      { status: 500, headers },
    );
  }
}

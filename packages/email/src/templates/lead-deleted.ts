import { baseTemplate } from "./base.js";

export interface LeadDeletedEmailData {
  brokerName: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  propertyTitle?: string;
}

// Sent to broker when a lead is deleted
export function getLeadDeletedEmail(data: LeadDeletedEmailData) {
  const { brokerName, leadName, leadEmail, leadPhone, propertyTitle } = data;

  const body = `
    <h2>Lead Removed</h2>
    <p>Hi <strong>${brokerName}</strong>,</p>
    <p>
      The following lead has been removed from your CRM:
    </p>
    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
      <p style="margin: 0 0 4px 0;"><strong style="color: #18181b;">${leadName}</strong></p>
      ${leadEmail ? `<p style="margin: 0; color: #71717a; font-size: 13px;">📧 ${leadEmail}</p>` : ""}
      ${leadPhone ? `<p style="margin: 0; color: #71717a; font-size: 13px;">📱 ${leadPhone}</p>` : ""}
      ${propertyTitle ? `<p style="margin: 4px 0 0 0; color: #71717a; font-size: 13px;">🏠 ${propertyTitle}</p>` : ""}
    </div>
    <p style="color: #71717a; font-size: 13px;">
      This action cannot be undone. If this was a mistake, you'll need to re-create the lead manually.
    </p>
  `;

  return {
    subject: `Lead Removed: ${leadName}`,
    html: baseTemplate({ title: "Lead Removed", body }),
  };
}

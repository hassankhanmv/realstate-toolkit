import { baseTemplate } from "./base.js";

export interface LeadCreatedEmailData {
  brokerName: string;
  leadName: string;
  propertyTitle?: string;
  phone?: string;
  email?: string;
  message?: string;
}

export function getLeadCreatedEmail(data: LeadCreatedEmailData) {
  const { brokerName, leadName, propertyTitle, phone, email, message } = data;

  const detailRows = [
    { label: "Lead Name", value: leadName },
    ...(propertyTitle ? [{ label: "Property", value: propertyTitle }] : []),
    ...(phone ? [{ label: "Phone", value: phone }] : []),
    ...(email ? [{ label: "Email", value: email }] : []),
  ];

  const detailsHtml = detailRows
    .map(
      (row) => `
      <tr>
        <td style="padding: 8px 12px; font-size: 13px; font-weight: 600; color: #71717a; border-bottom: 1px solid #f4f4f5;">${row.label}</td>
        <td style="padding: 8px 12px; font-size: 14px; color: #18181b; border-bottom: 1px solid #f4f4f5;">${row.value}</td>
      </tr>`,
    )
    .join("");

  const body = `
    <h2>New Lead Received! 🔔</h2>
    <p>Hi <strong>${brokerName}</strong>,</p>
    <p>A new lead has just come in. Here are the details:</p>

    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #e4e4e7; border-radius: 8px;">
      ${detailsHtml}
    </table>

    ${message ? `<div style="background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 16px 0; font-size: 14px;"><strong>Message:</strong><br/>${message}</div>` : ""}

    <p>Respond quickly to maximise your chances of closing the deal!</p>
  `;

  return {
    subject: `New Lead: ${leadName}${propertyTitle ? ` — ${propertyTitle}` : ""}`,
    html: baseTemplate({ title: "New Lead", body }),
  };
}

import { baseTemplate } from "./base.js";

export interface PasswordResetRequestEmailProps {
  adminName: string;
  agentName: string;
  agentEmail: string;
  note?: string;
  dashBoardUrl: string;
}

export const getPasswordResetRequestEmail = (
  data: PasswordResetRequestEmailProps,
): { subject: string; html: string } => {
  const subject = `Password Reset Request from ${data.agentName}`;

  let noteHtml = "";
  if (data.note) {
    noteHtml = `
      <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; margin: 24px 0; padding: 16px; border-radius: 0 4px 4px 0;">
        <h3 style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">They included the following note:</h3>
        <p style="color: #1f2937; font-size: 16px; margin: 0; font-style: italic;">"${data.note}"</p>
      </div>
    `;
  }

  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${data.adminName},</p>
    <p>Your agent, <strong>${data.agentName}</strong> (${data.agentEmail}), has requested that you reset their password.</p>
    
    ${noteHtml}

    <p>You can log into your Admin Dashboard and navigate to the <strong>Users</strong> tab to reset their password.</p>
    <div style="text-align: center; margin-top: 32px;">
      <a href="${data.dashBoardUrl}" class="button">Go to Dashboard</a>
    </div>
  `;

  const html = baseTemplate({
    title: subject,
    body: content,
  });

  return { subject, html };
};

import { baseTemplate } from "./base.js";

export interface LoginNotificationEmailData {
  userFullName: string;
  loginTime: string;
  ipAddress?: string;
  deviceInfo?: string;
  dashBoardUrl: string;
}

export const getLoginNotificationEmail = (
  data: LoginNotificationEmailData,
): { subject: string; html: string } => {
  const subject = "New Login Alert - Real Estate Toolkit";

  let deviceInfoHtml = "";
  if (data.ipAddress || data.deviceInfo) {
    deviceInfoHtml = `
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #374151; font-size: 16px;">Login Details:</h3>
        <ul style="list-style-type: none; padding: 0; margin: 0; color: #4b5563;">
          ${data.ipAddress ? `<li style="margin-bottom: 8px;"><strong>IP Address:</strong> ${data.ipAddress}</li>` : ""}
          ${data.deviceInfo ? `<li><strong>Device:</strong> ${data.deviceInfo}</li>` : ""}
        </ul>
      </div>
    `;
  }

  const content = `
    <h2>Security Alert: New Login</h2>
    <p>Dear ${data.userFullName || "User"},</p>
    <p>We detected a new login to your Real Estate Toolkit account on <strong>${data.loginTime}</strong>.</p>
    ${deviceInfoHtml}
    <p>If this was you, you can safely ignore this email.</p>
    <p>If you did not authorize this login, please contact your administrator immediately or change your password.</p>
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

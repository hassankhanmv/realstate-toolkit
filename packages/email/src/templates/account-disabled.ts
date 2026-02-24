import { baseTemplate } from "./base.js";

export interface AccountDisabledEmailData {
  name: string;
  note?: string;
  supportEmail?: string;
}

export function getAccountDisabledEmail(data: AccountDisabledEmailData) {
  const { name, note, supportEmail = "support@realestate-toolkit.com" } = data;

  const body = `
    <h2>Notice: Your Account Has Been Disabled 🛑</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>
      We are writing to inform you that your Real Estate Toolkit account has been disabled by an administrator.
    </p>
    ${
      note
        ? `
    <div style="background-color: #fef2f2; border: 1px solid #f87171; padding: 12px; border-radius: 6px; margin: 16px 0;">
      <p style="margin: 0; color: #b91c1c;">
        <strong>Administrator Note:</strong><br/>
        ${note}
      </p>
    </div>
    `
        : ""
    }
    <p>
      If you believe this was a mistake or have any questions, please contact support or your administrator.
    </p>
    <p>
      <a href="mailto:${supportEmail}" class="btn">Contact Support</a>
    </p>
  `;

  return {
    subject: `Notice: Account Disabled`,
    html: baseTemplate({ title: "Account Disabled", body }),
  };
}

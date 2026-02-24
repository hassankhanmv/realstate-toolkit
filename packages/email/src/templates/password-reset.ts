import { baseTemplate } from "./base.js";

export interface PasswordResetEmailData {
  name: string;
  loginUrl?: string;
  newPassword?: string;
}

export function getPasswordResetEmail(data: PasswordResetEmailData) {
  const { name, loginUrl = "http://localhost:5173/login", newPassword } = data;

  const body = `
    <h2>Your Password Has Been Reset 🔐</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>
      An administrator has reset the password for your Real Estate Toolkit account.
      You can log in using your new credentials provided below. We recommend changing your password after logging in.
    </p>
    <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 16px 0;">
      <p style="margin: 0; font-family: monospace; font-size: 16px;">
        <strong>New Password:</strong> ${newPassword}
      </p>
    </div>
    <p>
      <a href="${loginUrl}" class="btn">Log in to your account</a>
    </p>
    <p>If you did not request this change or have any questions, please contact your administrator.</p>
  `;

  return {
    subject: `Your Password Has Been Reset`,
    html: baseTemplate({ title: "Password Reset", body }),
  };
}

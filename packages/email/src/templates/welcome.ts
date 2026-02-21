import { baseTemplate } from "./base.js";

export interface WelcomeEmailData {
  name: string;
  loginUrl?: string;
}

export function getWelcomeEmail(data: WelcomeEmailData) {
  const { name, loginUrl = "#" } = data;

  const body = `
    <h2>Welcome to RealEstate Toolkit! 🎉</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>
      Your account has been created successfully. You now have access to a powerful
      suite of tools to manage your properties, track leads, and grow your real estate business.
    </p>
    <p>
      <a href="${loginUrl}" class="btn">Go to Dashboard</a>
    </p>
    <p>If you have any questions, simply reply to this email — we're here to help.</p>
  `;

  return {
    subject: `Welcome to RealEstate Toolkit, ${name}!`,
    html: baseTemplate({ title: "Welcome", body }),
  };
}

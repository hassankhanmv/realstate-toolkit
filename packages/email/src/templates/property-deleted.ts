import { baseTemplate } from "./base.js";

export interface PropertyDeletedEmailData {
  name: string;
  propertyTitle: string;
}

export function getPropertyDeletedEmail(data: PropertyDeletedEmailData) {
  const { name, propertyTitle } = data;

  const body = `
    <h2>Property Deleted</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>
      This is a confirmation that the following property has been permanently removed
      from your portfolio:
    </p>
    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
      <strong style="color: #18181b;">${propertyTitle}</strong>
    </div>
    <p style="color: #71717a; font-size: 13px;">
      All associated data including media files have been removed. Lead records linked
      to this property are preserved for your reference.
    </p>
    <p>If this was a mistake, please contact support immediately.</p>
  `;

  return {
    subject: `Property Deleted: ${propertyTitle}`,
    html: baseTemplate({ title: "Property Deleted", body }),
  };
}

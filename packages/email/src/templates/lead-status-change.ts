import { baseTemplate } from "./base.js";

export interface LeadStatusChangeEmailData {
  brokerName: string;
  leadName: string;
  oldStatus: string;
  newStatus: string;
  propertyTitle?: string;
}

// Sent to broker when a lead status changes (e.g., Won, Lost)
export function getLeadStatusChangeEmail(data: LeadStatusChangeEmailData) {
  const { brokerName, leadName, oldStatus, newStatus, propertyTitle } = data;

  const statusColors: Record<string, string> = {
    New: "#3b82f6",
    Contacted: "#f59e0b",
    Viewing: "#8b5cf6",
    Negotiation: "#06b6d4",
    Won: "#22c55e",
    Lost: "#ef4444",
  };

  const body = `
    <h2>Lead Status Updated</h2>
    <p>Hi <strong>${brokerName}</strong>,</p>
    <p>
      The status of your lead <strong>${leadName}</strong> has been updated:
    </p>
    <div style="background: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="background: ${statusColors[oldStatus] || "#94a3b8"}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
          ${oldStatus}
        </span>
        <span style="color: #71717a; font-size: 18px;">→</span>
        <span style="background: ${statusColors[newStatus] || "#94a3b8"}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
          ${newStatus}
        </span>
      </div>
    </div>
    ${propertyTitle ? `<p style="color: #71717a; font-size: 13px;">Property: <strong>${propertyTitle}</strong></p>` : ""}
    <p style="color: #71717a; font-size: 13px;">
      ${newStatus === "Won" ? "🎉 Congratulations on closing this deal!" : ""}
      ${newStatus === "Lost" ? "Don't worry — keep nurturing your pipeline. New opportunities are always around the corner." : ""}
    </p>
  `;

  return {
    subject: `Lead ${leadName}: ${oldStatus} → ${newStatus}`,
    html: baseTemplate({ title: "Lead Status Update", body }),
  };
}

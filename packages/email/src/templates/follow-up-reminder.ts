import { baseTemplate } from "./base.js";

export interface FollowUpReminderEmailData {
  brokerName: string;
  leads: {
    name: string;
    phone?: string;
    propertyTitle?: string;
    followUpDate: string;
  }[];
}

// Sent to broker as a reminder of upcoming follow-ups
export function getFollowUpReminderEmail(data: FollowUpReminderEmailData) {
  const { brokerName, leads } = data;

  const leadsRows = leads
    .map(
      (lead) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; font-size: 13px; font-weight: 500;">
        ${lead.name}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; font-size: 13px; color: #71717a;">
        ${lead.propertyTitle || "—"}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; font-size: 13px; color: #71717a;">
        ${lead.phone || "—"}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e4e4e7; font-size: 13px;">
        <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600;">
          ${lead.followUpDate}
        </span>
      </td>
    </tr>
  `,
    )
    .join("");

  const body = `
    <h2>Follow-Up Reminder</h2>
    <p>Hi <strong>${brokerName}</strong>,</p>
    <p>You have <strong>${leads.length}</strong> lead(s) due for follow-up:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: #f4f4f5;">
          <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #71717a; letter-spacing: 0.5px;">Name</th>
          <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #71717a; letter-spacing: 0.5px;">Property</th>
          <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #71717a; letter-spacing: 0.5px;">Phone</th>
          <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #71717a; letter-spacing: 0.5px;">Due</th>
        </tr>
      </thead>
      <tbody>
        ${leadsRows}
      </tbody>
    </table>
    <p style="color: #71717a; font-size: 13px;">
      Stay on top of your pipeline — timely follow-ups increase your conversion rate significantly.
    </p>
  `;

  return {
    subject: `📅 ${leads.length} Follow-Up Reminder(s)`,
    html: baseTemplate({ title: "Follow-Up Reminder", body }),
  };
}

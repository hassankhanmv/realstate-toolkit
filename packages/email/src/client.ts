import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

/**
 * Get or create a singleton Nodemailer transporter.
 * Reads SMTP config from environment variables.
 */
function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Missing SMTP configuration. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.",
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using the configured SMTP transport.
 * @returns The nodemailer message info on success.
 * @throws Error if SMTP is not configured or delivery fails.
 */
export async function sendEmail(options: SendEmailOptions) {
  const transport = getTransporter();
  const from =
    process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@example.com";

  const info = await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  return info;
}

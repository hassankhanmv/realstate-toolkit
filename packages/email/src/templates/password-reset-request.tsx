import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from "@react-email/components";
import { render } from "@react-email/render";

interface PasswordResetRequestEmailProps {
  adminName: string;
  agentName: string;
  agentEmail: string;
  note?: string;
}

const PasswordResetRequestEmail = ({
  adminName,
  agentName,
  agentEmail,
  note,
}: PasswordResetRequestEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Password Reset Request from {agentName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password Reset Request</Heading>
          <Text style={text}>Hi {adminName},</Text>
          <Text style={text}>
            Your agent, <strong>{agentName}</strong> ({agentEmail}), has requested that you reset their password.
          </Text>
          
          {note && (
            <Section style={noteContainer}>
              <Text style={noteLabel}>They included the following note:</Text>
              <Text style={noteContent}>"{note}"</Text>
            </Section>
          )}

          <Text style={text}>
            You can log into your Admin Dashboard and navigate to the <strong>Users</strong> tab to reset their password.
          </Text>
          <Text style={footer}>
            This is an automated notification from your Real Estate Toolkit.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const getPasswordResetRequestEmail = (
  adminName: string,
  agentName: string,
  agentEmail: string,
  note?: string,
) => {
  const subject = `Password Reset Request from ${agentName}`;
  const html = render(
    React.createElement(PasswordResetRequestEmail, {
      adminName,
      agentName,
      agentEmail,
      note,
    })
  );

  return { subject, html };
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "17px 0 0",
  textAlign: "center" as const,
  margin: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 48px",
};

const noteContainer = {
  backgroundColor: "#f9fafb",
  borderLeft: "4px solid #3b82f6",
  margin: "24px 48px",
  padding: "16px",
  borderRadius: "0 4px 4px 0",
};

const noteLabel = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "0 0 8px 0",
  fontWeight: "bold",
};

const noteContent = {
  color: "#1f2937",
  fontSize: "16px",
  margin: "0",
  fontStyle: "italic" as const,
};

const footer = {
  color: "#898989",
  fontSize: "14px",
  lineHeight: "22px",
  padding: "0 48px",
  marginTop: "32px",
};

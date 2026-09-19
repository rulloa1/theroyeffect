import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  projectTitle?: string;
  daysLeft?: number;
  retainerUrl?: string;
}

const Email = ({
  name = "there",
  projectTitle = "your project",
  daysLeft = 2,
  retainerUrl = "https://www.theroyeffect.com/pricing",
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your support window wraps up in {String(daysLeft)} {daysLeft === 1 ? "day" : "days"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>THE ROY EFFECT · SUPPORT WINDOW</Text>
        <Heading style={heading}>Support window closing soon</Heading>
        <Text style={text}>
          Hi {name}, your 14-day post-launch support window for{" "}
          <strong>{projectTitle}</strong> wraps up in {daysLeft}{" "}
          {daysLeft === 1 ? "day" : "days"}.
        </Text>
        <Text style={text}>
          After that, any new work is billed separately. If you'd like ongoing
          design and build capacity — priority turnaround, weekly sync, and
          someone who already knows your site — the monthly retainer covers it.
        </Text>
        <Section style={{ marginTop: "24px" }}>
          <Button style={button} href={retainerUrl}>
            See retainer options
          </Button>
        </Section>
        <Text style={text}>
          No pressure either way. Reply if you have questions or want to set it up.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Rory Ulloa — Creative Director, theroyeffect.com</Text>
      </Container>
    </Body>
  </Html>
);

export const template: TemplateEntry = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your support window wraps up soon — ${data?.["projectTitle"] ?? "your project"}`,
  displayName: "Support window closing",
  previewData: {
    name: "Marta",
    projectTitle: "Reyes Roofing — Website",
    daysLeft: 2,
    retainerUrl: "https://www.theroyeffect.com/pricing",
  },
};

const main = { backgroundColor: "#05050a", fontFamily: "Helvetica, Arial, sans-serif" };
const container = {
  backgroundColor: "#0a0a12",
  margin: "0 auto",
  padding: "36px 32px",
  maxWidth: "560px",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderTop: "2px solid #dfba73",
};
const kicker = {
  fontSize: "11px",
  letterSpacing: "3px",
  color: "#DFBA73",
  margin: "0 0 8px",
  fontWeight: "bold",
};
const heading = { fontSize: "26px", margin: "0 0 16px", color: "#ffffff", fontWeight: "bold" };
const text = { fontSize: "14px", lineHeight: "22px", color: "#e5e7eb" };
const button = {
  backgroundColor: "#E51924",
  color: "#ffffff",
  fontSize: "13px",
  letterSpacing: "1px",
  padding: "14px 28px",
  textDecoration: "none",
  fontWeight: "bold",
  display: "inline-block",
};
const hr = { borderColor: "rgba(255, 255, 255, 0.1)", margin: "24px 0" };
const footer = { fontSize: "11px", color: "#9ca3af" };

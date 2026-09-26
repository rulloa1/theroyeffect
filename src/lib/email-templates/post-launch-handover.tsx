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
  walkthroughUrl?: string;
  portalUrl?: string;
  quickStartItems?: string[];
}

const Email = ({
  name = "there",
  projectTitle = "your project",
  walkthroughUrl,
  portalUrl = "https://www.theroyeffect.com/portal",
  quickStartItems = [],
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your site is live — here's how to manage it</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>THE ROY EFFECT · LAUNCH COMPLETE</Text>
        <Heading style={heading}>Your site is live</Heading>
        <Text style={text}>
          Hi {name}, <strong>{projectTitle}</strong> is live. Here's everything you need to manage
          it.
        </Text>
        {walkthroughUrl ? (
          <Section style={{ marginTop: "24px" }}>
            <Button style={button} href={walkthroughUrl}>
              Watch the 10-minute walkthrough
            </Button>
          </Section>
        ) : null}
        {quickStartItems.length > 0 ? (
          <Section style={{ marginTop: "20px" }}>
            <Text style={label}>QUICK START</Text>
            {quickStartItems.map((item, i) => (
              <Text key={i} style={item_}>
                — {item}
              </Text>
            ))}
          </Section>
        ) : null}
        <Text style={text}>
          You have access to everything: the CMS, hosting, analytics, and your{" "}
          <Link href={portalUrl} style={link}>
            client portal
          </Link>
          .
        </Text>
        <Text style={text}>
          Your 14-day support window started today. If anything breaks or looks off, reply to this
          email and I'll fix it — no charge.
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
    `Your site is live — ${data?.["projectTitle"] ?? "project"} handover`,
  displayName: "Post-launch handover",
  previewData: {
    name: "Marta",
    projectTitle: "Reyes Roofing — Website",
    walkthroughUrl: "https://www.loom.com/share/example",
    portalUrl: "https://www.theroyeffect.com/portal",
    quickStartItems: [
      "Edit content: Log in at /admin with your credentials",
      "Check leads: Inquiries appear in the admin dashboard",
      "View analytics: Dashboard linked in your portal",
    ],
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
const label = {
  fontSize: "10px",
  letterSpacing: "2px",
  color: "#9ca3af",
  margin: "0 0 8px",
  fontWeight: "bold",
};
const item_ = { fontSize: "13px", lineHeight: "20px", color: "#e5e7eb", margin: "0 0 4px" };
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
const link = { color: "#E51924", textDecoration: "underline", fontWeight: "bold" };
const footer = { fontSize: "11px", color: "#9ca3af" };

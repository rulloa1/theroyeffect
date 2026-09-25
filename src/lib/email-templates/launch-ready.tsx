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
  goLiveDate?: string;
  checklist?: string[];
  portalUrl?: string;
}

const Email = ({
  name = "there",
  projectTitle = "your project",
  goLiveDate,
  checklist = [],
  portalUrl = "https://www.theroyeffect.com/portal",
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Launch readiness — {projectTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>THE ROY EFFECT · LAUNCH READINESS</Text>
        <Heading style={heading}>Ready to go live</Heading>
        <Text style={text}>
          Hi {name}, the build for <strong>{projectTitle}</strong> is complete and tested. We're
          ready to launch.
        </Text>
        {goLiveDate ? (
          <Text style={text}>
            <strong style={strong}>Target go-live:</strong> {goLiveDate}
          </Text>
        ) : null}
        {checklist.length > 0 ? (
          <Section style={{ marginTop: "16px" }}>
            <Text style={label}>PRE-LAUNCH CHECKLIST</Text>
            {checklist.map((item, i) => (
              <Text key={i} style={item_}>
                ✓ {item}
              </Text>
            ))}
          </Section>
        ) : null}
        <Text style={text}>
          What I need from you: domain DNS access (or let me know if you'd like me to handle it),
          and any final content changes before we cut over.
        </Text>
        <Section style={{ marginTop: "24px" }}>
          <Button style={button} href={portalUrl}>
            Open your client portal
          </Button>
        </Section>
        <Text style={text}>Reply with any last changes or the green light to launch.</Text>
        <Hr style={hr} />
        <Text style={footer}>Rory Ulloa — Creative Director, theroyeffect.com</Text>
      </Container>
    </Body>
  </Html>
);

export const template: TemplateEntry = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Launch readiness — ${data?.["projectTitle"] ?? "your project"}`,
  displayName: "Launch ready",
  previewData: {
    name: "Marta",
    projectTitle: "Reyes Roofing — Website",
    goLiveDate: "Friday, October 18",
    checklist: [
      "All forms tested end-to-end",
      "Mobile + desktop verified",
      "Analytics + SEO tags configured",
      "Performance optimized",
    ],
    portalUrl: "https://www.theroyeffect.com/portal",
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
const strong = { color: "#ffffff" };
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
const footer = { fontSize: "11px", color: "#9ca3af" };

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
  designUrl?: string;
  portalUrl?: string;
  notes?: string;
}

const Email = ({
  name = "there",
  projectTitle = "your project",
  designUrl,
  portalUrl = "https://www.theroyeffect.com/portal",
  notes,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your design is ready for review — {projectTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>THE ROY EFFECT · DESIGN APPROVAL</Text>
        <Heading style={heading}>Your design is ready</Heading>
        <Text style={text}>
          Hi {name}, the full design for <strong>{projectTitle}</strong> is ready for your review.
        </Text>
        <Text style={text}>
          Take a look through every screen. This is the design that will go live — nothing gets
          built until you approve it, and what you approve is what ships.
        </Text>
        {notes ? <Text style={text}>{notes}</Text> : null}
        {designUrl ? (
          <Section style={{ marginTop: "24px" }}>
            <Button style={button} href={designUrl}>
              Review the design
            </Button>
          </Section>
        ) : null}
        <Text style={text}>
          Reply with "approved" if everything looks right, or tell me what to adjust. You can also
          review it in your{" "}
          <Link href={portalUrl} style={link}>
            client portal
          </Link>
          .
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
    `Your design is ready for review — ${data?.["projectTitle"] ?? "your project"}`,
  displayName: "Design approval request",
  previewData: {
    name: "Marta",
    projectTitle: "Reyes Roofing — Website",
    designUrl: "https://www.figma.com/proto/example",
    portalUrl: "https://www.theroyeffect.com/portal",
    notes:
      "I've highlighted the two areas we discussed changing in round 2. Everything else matches the approved direction.",
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
const link = { color: "#E51924", textDecoration: "underline", fontWeight: "bold" };
const footer = { fontSize: "11px", color: "#9ca3af" };

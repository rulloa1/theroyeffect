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
  domain?: string;
  fix1?: string;
  fix2?: string;
  fix3?: string;
  videoUrl?: string;
  bookUrl?: string;
}

const Email = ({
  name = "there",
  domain = "your site",
  fix1,
  fix2,
  fix3,
  videoUrl,
  bookUrl = "https://www.theroyeffect.com/book",
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your website audit for {domain} — 3 fixes inside</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>THE ROY EFFECT · AUDIT DELIVERED</Text>
        <Heading style={heading}>Your website audit is ready</Heading>
        <Text style={text}>
          Hi {name}, I recorded a 5-minute teardown of {domain}. Here's what I found:
        </Text>
        <Section style={fixList}>
          {fix1 ? <Text style={fixItem}>1. {fix1}</Text> : null}
          {fix2 ? <Text style={fixItem}>2. {fix2}</Text> : null}
          {fix3 ? <Text style={fixItem}>3. {fix3}</Text> : null}
        </Section>
        {videoUrl ? (
          <Section style={{ marginTop: "24px" }}>
            <Button style={button} href={videoUrl}>
              Watch the full teardown
            </Button>
          </Section>
        ) : null}
        <Text style={text}>
          If you want me to make these fixes, we can talk. If not, the notes are yours to keep.
        </Text>
        <Text style={text}>
          <Link href={bookUrl} style={link}>
            Book a call if you'd like to go further
          </Link>
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
    `Your website audit for ${data?.["domain"] ?? "your site"} — 3 fixes inside`,
  displayName: "Audit delivered",
  previewData: {
    name: "Marta",
    domain: "mcdesign.bio",
    fix1: "Move the booking button above the fold on mobile — it's currently below the hero image.",
    fix2: "Reduce the contact form from 8 fields to 3 (name, email, message) — every extra field cuts submissions.",
    fix3: "Add a single headline that says what you do, not who you are — visitors spend 3 seconds before deciding.",
    videoUrl: "https://www.loom.com/share/example",
    bookUrl: "https://www.theroyeffect.com/book",
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
const fixList = { marginTop: "16px" };
const fixItem = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#ffffff",
  margin: "0 0 8px",
};
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

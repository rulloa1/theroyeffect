import React from "react";
import {
  Body,
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
  shipped?: string[];
  inProgress?: string[];
  upNext?: string[];
  blockers?: string;
  portalUrl?: string;
}

const Email = ({
  name = "there",
  shipped = [],
  inProgress = [],
  upNext = [],
  blockers,
  portalUrl = "https://www.theroyeffect.com/portal",
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Weekly sync — what shipped and what's next</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>THE ROY EFFECT · WEEKLY SYNC</Text>
        <Heading style={heading}>Weekly sync</Heading>
        <Text style={text}>Hi {name}, here's where things stand:</Text>
        {shipped.length > 0 ? (
          <Section style={{ marginTop: "16px" }}>
            <Text style={label}>SHIPPED LAST WEEK</Text>
            {shipped.map((item, i) => (
              <Text key={i} style={item_}>✓ {item}</Text>
            ))}
          </Section>
        ) : null}
        {inProgress.length > 0 ? (
          <Section style={{ marginTop: "16px" }}>
            <Text style={label}>IN PROGRESS</Text>
            {inProgress.map((item, i) => (
              <Text key={i} style={item_}>→ {item}</Text>
            ))}
          </Section>
        ) : null}
        {upNext.length > 0 ? (
          <Section style={{ marginTop: "16px" }}>
            <Text style={label}>UP NEXT</Text>
            {upNext.map((item, i) => (
              <Text key={i} style={item_}>{item}</Text>
            ))}
          </Section>
        ) : null}
        {blockers ? (
          <Section style={{ marginTop: "16px" }}>
            <Text style={label}>BLOCKERS / QUESTIONS</Text>
            <Text style={text}>{blockers}</Text>
          </Section>
        ) : null}
        <Text style={text}>
          Reply with any changes to priority. Full project status in your{" "}
          <Link href={portalUrl} style={link}>client portal</Link>.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>Rory Ulloa — Creative Director, theroyeffect.com</Text>
      </Container>
    </Body>
  </Html>
);

export const template: TemplateEntry = {
  component: Email,
  subject: () => `Weekly sync — The Roy Effect`,
  displayName: "Retainer weekly sync",
  previewData: {
    name: "Marta",
    shipped: ["Updated homepage hero", "Fixed mobile nav overflow"],
    inProgress: ["Services page redesign", "Contact form spam protection"],
    upNext: ["Case study page", "Analytics dashboard setup"],
    blockers: "Need final approval on the services page copy.",
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
const label = {
  fontSize: "10px",
  letterSpacing: "2px",
  color: "#9ca3af",
  margin: "0 0 8px",
  fontWeight: "bold",
};
const item_ = { fontSize: "13px", lineHeight: "20px", color: "#e5e7eb", margin: "0 0 4px" };
const hr = { borderColor: "rgba(255, 255, 255, 0.1)", margin: "24px 0" };
const link = { color: "#E51924", textDecoration: "underline", fontWeight: "bold" };
const footer = { fontSize: "11px", color: "#9ca3af" };

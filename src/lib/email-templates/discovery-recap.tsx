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
  businessName?: string;
  summary?: string;
  recommendedTier?: string;
  whyFit?: string;
  timeline?: string;
  investment?: string;
  deposit?: string;
  includes?: string[];
  proposalUrl?: string;
}

const Email = ({
  name = "there",
  businessName,
  summary,
  recommendedTier,
  whyFit,
  timeline,
  investment,
  deposit,
  includes = [],
  proposalUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Recap from our call{businessName ? ` — ${businessName}` : ""}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={kicker}>THE ROY EFFECT · CALL RECAP</Text>
        <Heading style={heading}>Recap from our call</Heading>
        <Text style={text}>Hi {name}, great talking today. Here's where I land:</Text>
        {summary ? (
          <Text style={text}>
            <strong style={strong}>What you're solving:</strong> {summary}
          </Text>
        ) : null}
        {recommendedTier ? (
          <Text style={text}>
            <strong style={strong}>What I recommend:</strong> {recommendedTier}
            {whyFit ? ` — ${whyFit}` : ""}
          </Text>
        ) : null}
        {timeline ? (
          <Text style={text}>
            <strong style={strong}>Timeline:</strong> {timeline}
          </Text>
        ) : null}
        {investment ? (
          <Text style={text}>
            <strong style={strong}>Investment:</strong> {investment}
            {deposit ? ` · ${deposit} to start` : ""}
          </Text>
        ) : null}
        {includes.length > 0 ? (
          <Section style={{ marginTop: "16px" }}>
            <Text style={label}>WHAT'S INCLUDED</Text>
            {includes.map((item, i) => (
              <Text key={i} style={item_}>
                — {item}
              </Text>
            ))}
          </Section>
        ) : null}
        {proposalUrl ? (
          <Section style={{ marginTop: "24px" }}>
            <Button style={button} href={proposalUrl}>
              Review &amp; sign your proposal
            </Button>
          </Section>
        ) : null}
        <Text style={text}>Any questions, reply to this email.</Text>
        <Hr style={hr} />
        <Text style={footer}>Rory Ulloa — Creative Director, theroyeffect.com</Text>
      </Container>
    </Body>
  </Html>
);

export const template: TemplateEntry = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Recap from our call — ${data?.["businessName"] ?? data?.["name"] ?? "your project"}`,
  displayName: "Discovery call recap",
  previewData: {
    name: "Marta",
    businessName: "Reyes Roofing",
    summary:
      "Your current site loads slowly on mobile and the contact form is buried below the fold. You're getting visits from Google but most bounce before reaching the form.",
    recommendedTier: "Design + Build",
    whyFit: "you need both the design work and a live, fast site — not just mockups.",
    timeline: "4-5 weeks from kickoff to launch",
    investment: "$8,000",
    deposit: "$4,000 deposit",
    includes: [
      "Full responsive design (mobile → desktop)",
      "No-code build with CMS, forms & payments",
      "Launch, analytics & SEO basics",
      "14-day post-launch support",
    ],
    proposalUrl: "https://www.theroyeffect.com/proposal/example",
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

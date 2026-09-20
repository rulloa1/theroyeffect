import React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  businessName?: string;
  body?: string;
  redesignUrl?: string;
  topIssue?: string | null;
}

const main = { backgroundColor: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" };
const container = { padding: "28px 24px", maxWidth: "560px" };
const text = { fontSize: "15px", lineHeight: "24px", color: "#111111", margin: "0 0 14px" };
const button = {
  backgroundColor: "#0a0a0a",
  color: "#dfba73",
  borderRadius: "0px",
  padding: "13px 24px",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block",
};
const caption = { fontSize: "12px", lineHeight: "18px", color: "#666666", margin: "8px 0 0" };
const small = { fontSize: "12px", lineHeight: "18px", color: "#666666", margin: "0" };

const Email = ({ businessName, body, redesignUrl, topIssue }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {topIssue
        ? `${topIssue} — I rebuilt the homepage for ${businessName ?? "your business"}`
        : `I rebuilt the homepage for ${businessName ?? "your business"}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {(body ?? "").split(/\n{2,}/).map((paragraph, index) => (
          <Text key={index} style={text}>
            {paragraph}
          </Text>
        ))}
        {redesignUrl ? (
          <Section style={{ margin: "22px 0" }}>
            <Button href={redesignUrl} style={button}>
              See the rebuilt homepage
            </Button>
            <Text style={caption}>
              This is a real page, not a mockup. Nothing on your site was changed.
            </Text>
          </Section>
        ) : null}
        <Text style={text}>
          Rory Ulloa
          <br />
          The Roy Effect · Houston, TX
        </Text>
        <Hr style={{ borderColor: "#eeeeee", margin: "20px 0" }} />
        <Text style={small}>theroyeffect.com · rory@theroyeffect.com · (281) 323-0450</Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    (data["subject"] as string) ?? "I rebuilt your homepage — take a look",
  displayName: "Redesign pitch",
  previewData: {
    businessName: "Whitfield Plumbing",
    subject: "I rebuilt your homepage — take a look",
    body: "Dana —\n\nI spent an hour on whitfieldplumbing.com this morning and rebuilt the homepage to show what I mean rather than describe it. The link below is a real page, not a mockup.\n\nThree things are costing you enquiries: the quote form can't be completed on a phone, the homepage opens with company history instead of what you do, and there are five logo versions in circulation.\n\nThe redesign fixes all three. If it's close, I'll walk you through it on a 15-minute call.\n\n— Rory",
    redesignUrl: "https://theroyeffect.com/redesign/example",
    topIssue: "Not built for phones",
  },
} satisfies TemplateEntry;

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

const Email = ({ businessName, body, redesignUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`A redesign concept for ${businessName ?? "your website"}`}</Preview>
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
              See the concept
            </Button>
            <Text style={caption}>
              A concept page laying out what I would change. Nothing on your own site has been
              touched.
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
    (data["subject"] as string) ?? "A redesign concept for your website",
  displayName: "Redesign pitch",
  previewData: {
    businessName: "whitfieldplumbing.com",
    subject: "Your quote form doesn't work on a phone",
    body: "I went through whitfieldplumbing.com this morning. The quote form can't be completed on a phone, and the homepage opens with company history rather than what you do.\n\nI put together a concept for how I'd rearrange it: the service and the city first, the quote request above the fold, and one logo instead of the several in circulation.\n\nIf it's close to what you had in mind, I'll walk you through it on a 15-minute call.\n\n— Rory",
    redesignUrl: "https://theroyeffect.com/redesign/example",
  },
} satisfies TemplateEntry;

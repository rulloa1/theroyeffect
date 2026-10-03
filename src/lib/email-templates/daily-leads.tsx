import React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Lead {
  name: string;
  industry: string;
  problem: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface Props {
  niches?: string;
  leads?: Lead[];
}

function DailyLeads({ niches = "", leads = [] }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{`${leads.length} new leads from today's search`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={kicker}>DEAL FINDER</Text>
          <Heading style={headingStyle}>{`${leads.length} new leads today`}</Heading>
          <Text style={text}>{`Searched: ${niches}. Nothing has been sent to anyone. Review and approve pitches in your dashboard.`}</Text>
          <Hr style={hr} />
          {leads.map((lead, i) => (
            <Section key={i} style={{ marginBottom: "16px" }}>
              <Text style={{ ...text, margin: 0, fontWeight: "bold", color: "#ffffff" }}>{lead.name}</Text>
              <Text style={{ ...small, margin: "2px 0" }}>{`${lead.industry}: ${lead.problem}`}</Text>
              <Text style={{ ...small, margin: 0 }}>
                {[lead.website, lead.phone, lead.email ?? "no email found"].filter(Boolean).join(" · ")}
              </Text>
            </Section>
          ))}
          <Hr style={hr} />
          <Button href="https://theroyeffect.com/admin" style={button}>
            Open Deal Finder
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: DailyLeads,
  subject: (d: Record<string, unknown>) =>
    `${Array.isArray(d["leads"]) ? d["leads"].length : 0} new leads from today's search`,
  displayName: "Daily leads digest",
  to: "rory@theroyeffect.com",
  previewData: {
    niches: "Roofers, Dentists",
    leads: [{ name: "Example Roofing", industry: "Roofers", problem: "No website at all", phone: "(555) 123-4567" }],
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#05050a", fontFamily: "Helvetica, Arial, sans-serif" };
const container = {
  backgroundColor: "#0a0a12",
  margin: "0 auto",
  padding: "36px 32px",
  maxWidth: "560px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};
const kicker = { fontSize: "11px", letterSpacing: "3px", color: "#FF3333", margin: "0 0 8px", fontWeight: "bold" };
const headingStyle = { fontSize: "26px", margin: "0 0 16px", color: "#ffffff", fontWeight: "bold" };
const text = { fontSize: "14px", lineHeight: "22px", color: "#e5e7eb" };
const small = { fontSize: "12px", lineHeight: "18px", color: "#9ca3af" };
const hr = { borderColor: "rgba(255, 255, 255, 0.1)", margin: "24px 0" };
const button = { backgroundColor: "#FF3333", color: "#000000", padding: "12px 20px", fontWeight: "bold", fontSize: "13px" };

import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { buildRedesignPdf, wrap } from "@/lib/redesign/pdf.server";
import type { RedesignRun } from "@/utils/redesign.functions";

const baseRun: RedesignRun = {
  id: "11111111-1111-4111-8111-111111111111",
  url: "https://whitfieldplumbing.com/",
  host: "whitfieldplumbing.com",
  treatment: "cinematic_3d",
  angle: "lost_enquiries",
  status: "draft",
  scan: {
    reachable: true,
    loadMs: 4200,
    https: true,
    mobileFriendly: false,
    hasPhoneLink: false,
    hasContactForm: true,
    hasBookingCta: false,
    copyrightYear: 2019,
  },
  headline: "THE SERVICE FIRST, NOT THE HISTORY",
  subheadline: "A homepage that opens with the job and the city.",
  sections: [
    { title: "WHAT I FOUND", body: "The quote form cannot be completed on a phone." },
    { title: "THE IDEA", body: "Lead with the service and the city, then the quote." },
  ],
  outreach_subject: "Your quote form doesn't work on a phone",
  outreach_body: "I went through the site this morning.",
  error_message: null,
  created_at: "2026-09-20T12:00:00.000Z",
  share_token: "abcdef0123456789abcdef0123456789",
  share_viewed_at: null,
  contact_email: "dana@whitfieldplumbing.com",
  lead_id: null,
  sent_at: null,
};

const SHARE_URL = "https://theroyeffect.com/redesign/abcdef0123456789abcdef0123456789";

/** A PDF always starts with the %PDF- header. */
const isPdf = (bytes: Uint8Array) => new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";

describe("buildRedesignPdf", () => {
  it("renders a PDF for a complete run", async () => {
    const bytes = await buildRedesignPdf(baseRun, SHARE_URL);
    expect(isPdf(bytes)).toBe(true);
    expect(bytes.byteLength).toBeGreaterThan(1000);
  });

  it("renders when the pitch copy is missing entirely", async () => {
    const bytes = await buildRedesignPdf(
      { ...baseRun, headline: null, subheadline: null, sections: [] },
      SHARE_URL,
    );
    expect(isPdf(bytes)).toBe(true);
  });

  it("renders when the scan recorded nothing", async () => {
    const bytes = await buildRedesignPdf({ ...baseRun, scan: {} }, SHARE_URL);
    expect(isPdf(bytes)).toBe(true);
  });

  it("paginates very long section copy instead of throwing", async () => {
    const bytes = await buildRedesignPdf(
      {
        ...baseRun,
        sections: [
          { title: "LONG", body: "word ".repeat(1200).trim() },
          { title: "UNBREAKABLE", body: "y".repeat(300) },
        ],
      },
      SHARE_URL,
    );
    expect(isPdf(bytes)).toBe(true);
    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBeGreaterThan(1);
  });
});

describe("wrap", () => {
  const MAX = 483.28; // the PDF's text column width

  const font = async () => {
    const pdf = await PDFDocument.create();
    return pdf.embedFont(StandardFonts.Helvetica);
  };

  it("keeps every line inside the column", async () => {
    const f = await font();
    const lines = wrap("The quote form cannot be completed on a phone. ".repeat(12), f, 11, MAX);
    for (const line of lines) {
      expect(f.widthOfTextAtSize(line, 11)).toBeLessThanOrEqual(MAX);
    }
  });

  it("hard-breaks a token too wide to fit, losing no characters", async () => {
    const f = await font();
    const token = "y".repeat(300);
    const lines = wrap(token, f, 11, MAX);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(f.widthOfTextAtSize(line, 11)).toBeLessThanOrEqual(MAX);
    }
    expect(lines.join("")).toBe(token);
  });

  it("preserves blank lines between paragraphs", async () => {
    const f = await font();
    expect(wrap("one\n\ntwo", f, 11, MAX)).toEqual(["one", "", "two"]);
  });
});

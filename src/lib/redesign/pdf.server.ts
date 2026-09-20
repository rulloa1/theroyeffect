import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { RedesignRun } from "./types";
import { treatmentLabel } from "./types";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const CRIMSON = rgb(1, 0.2, 0.2);
const GOLD = rgb(0.87, 0.73, 0.45);
const INK = rgb(0.09, 0.09, 0.11);
const MUTED = rgb(0.42, 0.42, 0.46);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/**
 * The audit notes that ship with the pitch: what was found on their site, what
 * the rebuild changed, and where the live page is.
 */
export async function buildRedesignAuditPdf(
  run: RedesignRun,
  shareUrl: string,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Website audit — ${run.business_name ?? run.host}`);
  pdf.setAuthor("The Roy Effect");

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const maxWidth = PAGE_W - MARGIN * 2;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };
  const ensure = (needed: number) => {
    if (y - needed < MARGIN) newPage();
  };
  const drawLines = (
    text: string,
    font: PDFFont,
    size: number,
    color = INK,
    leading = size * 1.45,
  ) => {
    for (const line of wrap(text, font, size, maxWidth)) {
      ensure(leading);
      if (line) page.drawText(line, { x: MARGIN, y: y - size, size, font, color });
      y -= leading;
    }
  };

  page.drawRectangle({ x: 0, y: PAGE_H - 10, width: PAGE_W, height: 10, color: CRIMSON });
  y -= 6;
  drawLines("THE ROY EFFECT", bold, 10, CRIMSON, 16);
  drawLines("WEBSITE AUDIT", bold, 26, INK, 32);
  drawLines(run.business_name ?? run.host, bold, 14, INK, 22);
  drawLines(
    `${run.host}  ·  ${treatmentLabel(run.treatment)}  ·  ${new Date(run.created_at)
      .toISOString()
      .slice(0, 10)}`,
    regular,
    9,
    MUTED,
    20,
  );
  y -= 8;

  const heading = (label: string) => {
    ensure(48);
    drawLines(label.toUpperCase(), bold, 9, CRIMSON, 16);
  };

  if (run.audit) {
    const grade =
      run.audit.score >= 40
        ? "Critical"
        : run.audit.score >= 20
          ? "Needs work"
          : run.audit.score > 0
            ? "Minor issues"
            : "Looks solid";
    heading("Verdict");
    drawLines(`${grade} — pain score ${run.audit.score} of 100`, bold, 13, INK, 20);
    y -= 8;

    heading("What we found");
    for (const signal of run.audit.signals.slice().sort((a, b) => b.weight - a.weight)) {
      ensure(44);
      drawLines(signal.label, bold, 11, INK, 16);
      drawLines(signal.detail, regular, 10, MUTED, 15);
      y -= 6;
    }
    y -= 4;
  }

  if (run.changes?.length) {
    heading("What the rebuild changed");
    for (const change of run.changes) {
      ensure(30);
      drawLines(`${change.index}  ${change.text}`, regular, 11, INK, 16);
      y -= 4;
    }
    y -= 4;
  }

  if (run.capture) {
    heading("Measured on the live page");
    const facts = [
      run.capture.loadMs !== null ? `Load time: ${(run.capture.loadMs / 1000).toFixed(1)}s` : null,
      `Secure (HTTPS): ${run.capture.https ? "yes" : "no"}`,
      `Built for phones: ${run.capture.mobileFriendly ? "yes" : "no"}`,
      `Tap-to-call: ${run.capture.hasPhoneLink ? "yes" : "no"}`,
      `Contact form: ${run.capture.hasContactForm ? "yes" : "no"}`,
      `Clear next step: ${run.capture.hasBookingCta ? "yes" : "no"}`,
      run.capture.copyrightYear ? `Footer copyright: ${run.capture.copyrightYear}` : null,
    ].filter(Boolean) as string[];
    drawLines(facts.join("\n"), regular, 10, MUTED, 15);
    y -= 8;
  }

  heading("The rebuilt page");
  drawLines(shareUrl, bold, 11, GOLD, 18);

  ensure(40);
  y -= 6;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.6,
    color: rgb(0.85, 0.85, 0.87),
  });
  y -= 18;
  drawLines("Rory Ulloa — Creative Director · theroyeffect.com", regular, 9, MUTED, 14);

  return await pdf.save();
}

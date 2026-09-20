import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { TREATMENT_LABEL } from "./redesign.server";
import type { RedesignRun } from "@/utils/redesign.functions";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const CRIMSON = rgb(1, 0.2, 0.2);
const GOLD = rgb(0.87, 0.73, 0.45);
const INK = rgb(0.09, 0.09, 0.11);
const MUTED = rgb(0.42, 0.42, 0.46);

/** Splits a single token too wide for one line into pieces that fit. */
function breakLongWord(word: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const pieces: string[] = [];
  let piece = "";
  for (const char of word) {
    if (piece && font.widthOfTextAtSize(piece + char, size) > maxWidth) {
      pieces.push(piece);
      piece = char;
    } else {
      piece += char;
    }
  }
  if (piece) pieces.push(piece);
  return pieces;
}

/**
 * Greedy word wrap. Exported for test: this copy renders model-written copy,
 * which can contain a long unbroken token (a URL, a run-on string), so an
 * over-wide word is hard-broken rather than left to overflow the margin.
 */
export function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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
        continue;
      }
      if (line) lines.push(line);
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        line = word;
        continue;
      }
      // The word alone overflows: emit full pieces, carry the remainder.
      const pieces = breakLongWord(word, font, size, maxWidth);
      lines.push(...pieces.slice(0, -1));
      line = pieces.at(-1) ?? "";
    }
    if (line) lines.push(line);
  }
  return lines;
}

/**
 * The redesign pitch as a sendable PDF: what the scan measured, the pitch
 * itself, and where the concept page lives.
 */
export async function buildRedesignPdf(run: RedesignRun, shareUrl: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Redesign concept — ${run.host}`);
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
  const heading = (labelText: string) => {
    ensure(48);
    drawLines(labelText.toUpperCase(), bold, 9, CRIMSON, 16);
  };

  page.drawRectangle({ x: 0, y: PAGE_H - 10, width: PAGE_W, height: 10, color: CRIMSON });
  y -= 6;
  drawLines("THE ROY EFFECT", bold, 10, CRIMSON, 16);
  drawLines("REDESIGN CONCEPT", bold, 26, INK, 32);
  drawLines(run.host, bold, 14, INK, 22);
  drawLines(
    `${TREATMENT_LABEL[run.treatment]}  ·  ${new Date(run.created_at).toISOString().slice(0, 10)}`,
    regular,
    9,
    MUTED,
    20,
  );
  y -= 8;

  if (run.headline) {
    heading("The idea");
    drawLines(run.headline, bold, 15, INK, 22);
    if (run.subheadline) drawLines(run.subheadline, regular, 11, MUTED, 16);
    y -= 8;
  }

  for (const section of run.sections) {
    ensure(60);
    heading(section.title);
    drawLines(section.body, regular, 11, INK, 16);
    y -= 6;
  }

  // What the scan actually measured, so nothing in the pitch is unsupported.
  const scan = run.scan ?? {};
  const facts = [
    typeof scan.loadMs === "number" ? `Load time: ${(scan.loadMs / 1000).toFixed(1)}s` : null,
    scan.https !== undefined ? `Secure (HTTPS): ${scan.https ? "yes" : "no"}` : null,
    scan.mobileFriendly !== undefined
      ? `Built for phones: ${scan.mobileFriendly ? "yes" : "no"}`
      : null,
    scan.hasPhoneLink !== undefined ? `Tap-to-call: ${scan.hasPhoneLink ? "yes" : "no"}` : null,
    scan.hasContactForm !== undefined
      ? `Contact form: ${scan.hasContactForm ? "yes" : "no"}`
      : null,
    scan.hasBookingCta !== undefined
      ? `Clear next step: ${scan.hasBookingCta ? "yes" : "no"}`
      : null,
    scan.copyrightYear ? `Footer copyright: ${scan.copyrightYear}` : null,
  ].filter(Boolean) as string[];

  if (facts.length > 0) {
    ensure(60);
    heading("Measured on the live page");
    drawLines(facts.join("\n"), regular, 10, MUTED, 15);
    y -= 8;
  }

  heading("The concept page");
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

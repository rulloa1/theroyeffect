import { describe, expect, it } from "vitest";
import {
  extractFonts,
  extractNavLabels,
  extractPalette,
  inferBusinessName,
  visibleText,
} from "@/lib/redesign/capture.server";

describe("visibleText", () => {
  it("drops scripts, styles, and comments", () => {
    const html = `
      <html><head><style>body{color:red}</style><script>var a = "hidden script";</script></head>
      <body><!-- a comment --><h1>Whitfield Plumbing</h1><p>Emergency repairs in Houston.</p></body></html>`;
    const text = visibleText(html);
    expect(text).toContain("Whitfield Plumbing");
    expect(text).toContain("Emergency repairs in Houston.");
    expect(text).not.toContain("hidden script");
    expect(text).not.toContain("color:red");
    expect(text).not.toContain("a comment");
  });

  it("decodes common entities and collapses whitespace", () => {
    expect(visibleText("<p>Drains&nbsp;&amp;   Sewers</p>")).toBe("Drains & Sewers");
  });
});

describe("extractNavLabels", () => {
  it("prefers nav links and de-duplicates them", () => {
    const html = `
      <nav><a href="/">Home</a><a href="/services">Services</a><a href="/services">Services</a></nav>
      <a href="/elsewhere">Ignored because a nav exists</a>`;
    expect(extractNavLabels(html)).toEqual(["Home", "Services"]);
  });

  it("falls back to page links when there is no nav", () => {
    const html = `<a href="/about">About</a><a href="/quote">Get a quote</a>`;
    expect(extractNavLabels(html)).toEqual(["About", "Get a quote"]);
  });
});

describe("extractPalette", () => {
  it("orders colours by frequency and expands shorthand hex", () => {
    const html = `<div style="color:#1a2b3c"></div><div style="color:#1a2b3c"></div><div style="background:#abc"></div>`;
    expect(extractPalette(html)).toEqual(["#1a2b3c", "#aabbcc"]);
  });

  it("ignores pure black and white, which say nothing about a brand", () => {
    expect(extractPalette(`<div style="color:#ffffff;background:#000000"></div>`)).toEqual([]);
  });
});

describe("extractFonts", () => {
  it("reads the first family off font-family declarations", () => {
    expect(extractFonts(`<div style='font-family: "Times New Roman", serif'></div>`)).toContain(
      "Times New Roman",
    );
  });

  it("reads families out of Google Fonts links", () => {
    const html = `<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap">`;
    expect(extractFonts(html)).toContain("Open Sans");
  });

  it("skips CSS variables and keywords", () => {
    expect(extractFonts(`<div style="font-family: var(--brand)"></div>`)).toEqual([]);
  });
});

describe("inferBusinessName", () => {
  it("prefers og:site_name", () => {
    const html = `<meta property="og:site_name" content="Whitfield Plumbing">`;
    expect(inferBusinessName(html, "Some Title | Home", "whitfieldplumbing.com")).toBe(
      "Whitfield Plumbing",
    );
  });

  it("falls back to the leading part of the title", () => {
    expect(inferBusinessName("", "Vale Cabinetry | Custom Kitchens", "valecabinetry.com")).toBe(
      "Vale Cabinetry",
    );
  });

  it("falls back to a humanised hostname", () => {
    expect(inferBusinessName("", null, "reed-and-co.studio")).toBe("Reed And Co");
    expect(inferBusinessName("", null, "www.ramandental.com")).toBe("Ramandental");
  });
});

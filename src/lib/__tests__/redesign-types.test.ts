import { describe, expect, it } from "vitest";
import { PIPELINE_STEPS, STEP_COUNT, normalizeSiteUrl, stepLabel } from "@/lib/redesign/types";
import { parseJsonObject } from "@/lib/redesign/design.server";
import { parsePitchResponse } from "@/lib/redesign/pitch.server";

describe("normalizeSiteUrl", () => {
  it("adds https to a bare hostname and strips www for the host", () => {
    expect(normalizeSiteUrl("whitfieldplumbing.com")).toEqual({
      url: "https://whitfieldplumbing.com/",
      host: "whitfieldplumbing.com",
    });
    expect(normalizeSiteUrl("www.ramandental.com/quote")).toEqual({
      url: "https://www.ramandental.com/quote",
      host: "ramandental.com",
    });
  });

  it("keeps an explicit http scheme rather than silently upgrading it", () => {
    expect(normalizeSiteUrl("http://valecabinetry.com").url).toBe("http://valecabinetry.com/");
  });

  it("drops the fragment", () => {
    expect(normalizeSiteUrl("example.com/page#anchor").url).toBe("https://example.com/page");
  });

  it("rejects empty input and things that are not hostnames", () => {
    expect(() => normalizeSiteUrl("   ")).toThrow(/Enter a website address/);
    expect(() => normalizeSiteUrl("localhost")).toThrow(/not a valid website address/);
    expect(() => normalizeSiteUrl("not a url at all")).toThrow(/not a valid website address/);
  });
});

describe("pipeline steps", () => {
  it("runs six steps ending at 100%", () => {
    expect(STEP_COUNT).toBe(6);
    expect(PIPELINE_STEPS.at(-1)?.progress).toBe(100);
  });

  it("increases progress monotonically", () => {
    const values = PIPELINE_STEPS.map((step) => step.progress);
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(new Set(values).size).toBe(values.length);
  });

  it("names the hero step after the chosen treatment", () => {
    expect(stepLabel("hero", "cinematic_3d")).toBe("Cinematic hero + 3D");
    expect(stepLabel("hero", "cinematic")).toBe("Cinematic hero");
    expect(stepLabel("hero", "editorial")).toBe("Editorial hero");
    // Every other step keeps its label whatever the treatment.
    expect(stepLabel("capture", "editorial")).toBe("Capture current site");
  });
});

describe("parseJsonObject", () => {
  it("tolerates code fences and leading prose", () => {
    expect(parseJsonObject('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseJsonObject('Here you go:\n{"a":2}')).toEqual({ a: 2 });
  });

  it("unwraps a single-element array", () => {
    expect(parseJsonObject('[{"a":3}]')).toEqual({ a: 3 });
  });

  it("throws when there is no JSON at all", () => {
    expect(() => parseJsonObject("sorry, I cannot help with that")).toThrow(/no JSON/);
  });
});

describe("parsePitchResponse", () => {
  it("accepts the alternate key names models drift to", () => {
    const draft = parsePitchResponse(
      '{"subject_line":"I rebuilt your homepage","emailBody":"Dana —\\n\\nHave a look.","why":"Worst mobile form in the set."}',
    );
    expect(draft.subject).toBe("I rebuilt your homepage");
    expect(draft.body).toContain("Dana");
    expect(draft.rationale).toBe("Worst mobile form in the set.");
  });

  it("throws when the subject or body is missing", () => {
    expect(() => parsePitchResponse('{"subject":"Only a subject"}')).toThrow(
      /missing subject or body/,
    );
  });

  it("caps runaway output", () => {
    const long = "x".repeat(9000);
    const draft = parsePitchResponse(JSON.stringify({ subject: long, body: long }));
    expect(draft.subject.length).toBe(140);
    expect(draft.body.length).toBe(4000);
  });
});

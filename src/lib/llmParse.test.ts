import { describe, it, expect } from "vitest";
import { parseLLMJson } from "./llmParse";

describe("parseLLMJson - extraction strategies", () => {
  it("parses strict JSON directly", () => {
    const result = parseLLMJson('{"feedback": "Good resume", "scores": {"ats": 80}}');
    expect(result.parseMethod).toBe("direct");
    expect(result.parsed.feedback).toBe("Good resume");
  });

  it("falls back to JSON5 for lenient syntax (trailing commas, unquoted-ish content)", () => {
    const result = parseLLMJson("{ feedback: 'Good resume', scores: { ats: 80, }, }");
    expect(result.parseMethod).toBe("json5-direct");
    expect(result.parsed.feedback).toBe("Good resume");
  });

  it("extracts JSON from a fenced code block", () => {
    const text = [
      "Here is the analysis:",
      "```json",
      '{"feedback": "Solid", "scores": {"ats": 70}}',
      "```",
      "Let me know if you need more detail.",
    ].join("\n");
    const result = parseLLMJson(text);
    expect(result.parseMethod).toBe("code-fence");
    expect(result.parsed.feedback).toBe("Solid");
  });

  it("extracts a balanced JSON object embedded in surrounding prose", () => {
    const text = 'Sure, here you go: {"feedback": "Needs work", "scores": {"ats": 40}} - hope that helps!';
    const result = parseLLMJson(text);
    expect(result.parseMethod).toBe("balanced-braces");
    expect(result.parsed.feedback).toBe("Needs work");
  });

  it("returns a null parsed result with no throw when nothing is parseable", () => {
    const result = parseLLMJson("Sorry, I cannot help with that request.");
    expect(result.parsed).toBeNull();
  });
});

describe("parseLLMJson -> normalizeParsed", () => {
  it("resolves score field aliases into the canonical scores shape", () => {
    const result = parseLLMJson('{"scores": {"ats": 85, "grammar": 90}}');
    expect(result.parsed.scores.atsCompatibility).toBe(85);
    expect(result.parsed.scores.grammarQuality).toBe(90);
  });

  it("clamps scores above 100 down to 100", () => {
    const result = parseLLMJson('{"scores": {"ats": "150%"}}');
    expect(result.parsed.scores.atsCompatibility).toBe(100);
  });

  it("clamps negative scores up to 0", () => {
    const result = parseLLMJson('{"scores": {"ats": -20}}');
    expect(result.parsed.scores.atsCompatibility).toBe(0);
  });

  it("coerces a delimited string of keywords into an array", () => {
    const result = parseLLMJson('{"missingCriticalKeywords": "React, Redux; TypeScript"}');
    expect(result.parsed.missingCriticalKeywords).toEqual(["React", "Redux", "TypeScript"]);
  });

  it("leaves an already-array field untouched", () => {
    const result = parseLLMJson('{"topActionItems": ["Add metrics", "Fix formatting"]}');
    expect(result.parsed.topActionItems).toEqual(["Add metrics", "Fix formatting"]);
  });
});

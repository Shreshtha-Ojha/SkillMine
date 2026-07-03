import { describe, it, expect } from "vitest";
import { simpleGrammarScore, simpleATSScore } from "./atsUtils";

describe("simpleGrammarScore", () => {
  it("returns 0 for empty text", () => {
    expect(simpleGrammarScore("")).toBe(0);
  });

  it("scores clean, short-sentence text highly", () => {
    const text = "This is a short sentence. Here is another one. Both are concise.";
    expect(simpleGrammarScore(text)).toBeGreaterThanOrEqual(90);
  });

  it("penalizes very long average sentence length", () => {
    const longSentence = "word ".repeat(60).trim() + ".";
    const shortSentence = "Short sentence here.";
    expect(simpleGrammarScore(longSentence)).toBeLessThan(simpleGrammarScore(shortSentence));
  });

  it("penalizes repeated punctuation issues", () => {
    const messy = "What is going on here??!! This is odd... very odd,, indeed.";
    const clean = "What is going on here. This is odd, very odd indeed.";
    expect(simpleGrammarScore(messy)).toBeLessThan(simpleGrammarScore(clean));
  });

  it("never returns a negative score", () => {
    const veryMessy = ("word ".repeat(200) + "!!!!....,,,,").trim();
    expect(simpleGrammarScore(veryMessy)).toBeGreaterThanOrEqual(0);
  });
});

describe("simpleATSScore", () => {
  it("returns 0 for an empty resume", () => {
    expect(simpleATSScore("", "some job description")).toBe(0);
  });

  it("scores higher when more JD keywords appear in the resume", () => {
    const jd = "react node mongodb typescript";
    const strongMatch = "Experienced with react node mongodb typescript development. ".repeat(20);
    const weakMatch = "Experienced professional with a passion for software. ".repeat(20);
    expect(simpleATSScore(strongMatch, jd)).toBeGreaterThan(simpleATSScore(weakMatch, jd));
  });

  it("falls back to a default keyword score when no JD is given", () => {
    const resume = "word ".repeat(300);
    // With no JD, jdWords is empty, so pct defaults to 30 per the implementation.
    const score = simpleATSScore(resume, "");
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("caps the score at 100", () => {
    const jd = "react";
    const resume = "react ".repeat(400);
    expect(simpleATSScore(resume, jd)).toBeLessThanOrEqual(100);
  });
});

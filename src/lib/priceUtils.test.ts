import { describe, it, expect } from "vitest";
import { computeOriginalPrice, computeDiscountPercent } from "./priceUtils";

describe("computeOriginalPrice", () => {
  it("returns null for null/undefined price", () => {
    expect(computeOriginalPrice(null)).toBeNull();
    expect(computeOriginalPrice(undefined)).toBeNull();
  });

  it("returns null for zero or negative price", () => {
    expect(computeOriginalPrice(0)).toBeNull();
    expect(computeOriginalPrice(-50)).toBeNull();
  });

  it("adds the default bump of 100 to a positive price", () => {
    expect(computeOriginalPrice(500)).toBe(600);
  });

  it("adds a custom bump", () => {
    expect(computeOriginalPrice(500, 250)).toBe(750);
  });
});

describe("computeDiscountPercent", () => {
  it("returns null when price is null/undefined", () => {
    expect(computeDiscountPercent(null, 100)).toBeNull();
    expect(computeDiscountPercent(undefined, 100)).toBeNull();
  });

  it("returns null when original is null/undefined", () => {
    expect(computeDiscountPercent(50, null)).toBeNull();
    expect(computeDiscountPercent(50, undefined)).toBeNull();
  });

  it("returns null when original is zero (avoids divide-by-zero)", () => {
    expect(computeDiscountPercent(50, 0)).toBeNull();
  });

  it("computes the correct discount percentage", () => {
    expect(computeDiscountPercent(75, 100)).toBe(25);
    expect(computeDiscountPercent(50, 200)).toBe(75);
  });

  it("rounds to the nearest whole percent", () => {
    expect(computeDiscountPercent(67, 100)).toBe(33);
  });
});

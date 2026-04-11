import { describe, it, expect } from "vitest";
import { extractHashtags } from "./utils";

describe("extractHashtags", () => {
  it("should extract multiple hashtags from text", () => {
    const text = "Hello #world this is a #test";
    const result = extractHashtags(text);
    expect(result).toEqual(["#world", "#test"]);
  });

  it("should return an empty array if no hashtags are present", () => {
    const text = "Hello world this is a test";
    const result = extractHashtags(text);
    expect(result).toEqual([]);
  });

  it("should handle hashtags with underscores", () => {
    const text = "Check this #cool_feature out!";
    const result = extractHashtags(text);
    expect(result).toEqual(["#cool_feature"]);
  });

  it("should handle non-English hashtags (e.g., Hebrew)", () => {
    const text = "שלום #עולם";
    const result = extractHashtags(text);
    expect(result).toEqual(["#עולם"]);
  });
});

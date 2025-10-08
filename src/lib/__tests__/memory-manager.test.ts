import { describe, expect, it } from "vitest";
import { MemoryManager, isMemorySignificant, formatMemoryTimestamp } from "../memory-manager";

describe("MemoryManager", () => {
  it("calculates higher importance for emotional interactions", () => {
    const manager = new MemoryManager();
    const neutral = manager.calculateMemoryImportance("hello", "hi", "neutral", 0.1);
    const emotional = manager.calculateMemoryImportance("I love this", "That's wonderful!", "joy", 0.9);

    expect(emotional).toBeGreaterThan(neutral);
    expect(emotional).toBeGreaterThan(0.2);
  });
});

describe("memory helpers", () => {
  it("detects significant memories", () => {
    expect(isMemorySignificant(0.4)).toBe(true);
    expect(isMemorySignificant(0.39)).toBe(false);
  });

  it("formats timestamps into friendly labels", () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    expect(formatMemoryTimestamp(now.toISOString())).toBe("Today");
    expect(formatMemoryTimestamp(yesterday)).toBe("Yesterday");
    expect(formatMemoryTimestamp(lastWeek)).toContain("week");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { SpectraPerformanceMonitor } from "../performance";
import { logger } from "../logger";

const noop = () => undefined;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SpectraPerformanceMonitor", () => {
  it("records durations using the provided timer", async () => {
    let time = 0;
    const monitor = new SpectraPerformanceMonitor(() => {
      time += 5;
      return time;
    });

    const performanceSpy = vi.spyOn(logger, "performance").mockImplementation(noop);

    const result = await monitor.trackVoiceOperation("tts_stream", "openai", async () => {
      return "ok";
    });

    expect(result).toBe("ok");
    expect(performanceSpy).toHaveBeenCalledWith("Performance", "voice_tts_stream", 5);

    const voiceMetrics = monitor.getVoiceMetrics();
    expect(voiceMetrics.ttsLatency).toBe(5);
    expect(voiceMetrics.serviceUsed).toBe("openai");
  });

  it("captures errors from tracked operations", async () => {
    const monitor = new SpectraPerformanceMonitor(() => 10);
    vi.spyOn(logger, "performance").mockImplementation(noop);

    const failingOperation = async () => {
      throw new Error("boom");
    };

    await expect(monitor.trackAsyncOperation("ai_generate", failingOperation)).rejects.toThrow("boom");

    const summary = monitor.getSummary();
    expect(summary.errorCount).toBe(1);
    expect(monitor.getRecentMetrics(1)[0].name).toBe("ai_generate_error");
  });
});

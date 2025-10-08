import { describe, expect, it, vi, afterEach } from "vitest";
import { SpectraLogger, LogLevel } from "../logger";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SpectraLogger", () => {
  it("suppresses debug messages when debug mode is disabled", () => {
    const logger = new SpectraLogger({ debug: false, logLevel: LogLevel.INFO });
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logger.debug("Test", "Hidden message");
    logger.info("Test", "Visible message");

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("INFO");
  });

  it("emits debug messages when debug mode is enabled", () => {
    const logger = new SpectraLogger({ debug: true });
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logger.debug("Diagnostics", "Rendered in debug mode", { foo: "bar" });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("DEBUG");
  });

  it("persists debug setting changes via setDebugMode", () => {
    const setItem = vi.fn();
    const getItem = vi.fn(() => undefined);
    const originalLocalStorage = globalThis.localStorage;
    // Provide a minimal localStorage shim for the test environment
    Object.defineProperty(globalThis, "localStorage", {
      value: { setItem, getItem },
      configurable: true,
    });

    const logger = new SpectraLogger({ debug: false });
    logger.setDebugMode(true);

    expect(logger.isDebugMode()).toBe(true);
    expect(setItem).toHaveBeenCalledWith("spectra-debug", "true");

    if (originalLocalStorage) {
      Object.defineProperty(globalThis, "localStorage", {
        value: originalLocalStorage,
        configurable: true,
      });
    } else {
      Reflect.deleteProperty(globalThis, "localStorage");
    }
  });
});

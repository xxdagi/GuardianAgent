import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";
import { api, type AlertResponse } from "../api";
import type { SafetySettings } from "../types/settings";
import { useSafetyMonitor } from "./useSafetyMonitor";

function createHookRunner() {
  const hooks: unknown[] = [];
  let hookIndex = 0;
  const effects: (() => (() => void) | void)[] = [];
  const cleanups: (() => void)[] = [];
  let dirty = false;

  const dispatcher = {
    useState(initial: unknown) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = typeof initial === "function" ? (initial as () => unknown)() : initial;
      }
      const setState = (action: unknown) => {
        const next =
          typeof action === "function"
            ? (action as (prev: unknown) => unknown)(hooks[idx])
            : action;
        if (!Object.is(hooks[idx], next)) {
          hooks[idx] = next;
          dirty = true;
        }
      };
      return [hooks[idx], setState];
    },
    useRef(initial: unknown) {
      const idx = hookIndex++;
      if (hooks[idx] === undefined) {
        hooks[idx] = { current: initial };
      }
      return hooks[idx];
    },
    useCallback(fn: unknown) {
      return fn;
    },
    useEffect(effect: () => (() => void) | void) {
      effects.push(effect);
    },
  };

  return {
    run<T>(hookFn: () => T): T {
      dirty = false;
      hookIndex = 0;
      (
        React as unknown as {
          __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: {
            ReactCurrentDispatcher: { current: unknown };
          };
        }
      ).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current =
        dispatcher;

      let result = hookFn();
      while (effects.length > 0) {
        const eff = effects.shift()!;
        const cleanup = eff();
        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
      }

      let passes = 0;
      while (dirty && passes < 10) {
        dirty = false;
        hookIndex = 0;
        passes++;
        result = hookFn();
      }

      return result;
    },
    unmount() {
      while (cleanups.length > 0) {
        const cleanup = cleanups.pop()!;
        cleanup();
      }
    },
  };
}

const mockSettings: SafetySettings = {
  language: "pl",
  contactName: "Ania",
  contactPhone: "+48123456789",
  alertPhrases: ["czy nakarmiłaś kota"],
  emergencyPhrases: ["zadzwoń do dziadka"],
  emergencyNumber: "+48987654321",
};

const mockAlertResponse: AlertResponse = {
  id: "alert-123",
  mapsUrl: "https://maps.google.com/?q=50.064700,19.945000",
  deliveries: [{ channel: "mock", status: "sent" }],
  createdAt: "2026-10-03T15:30:00Z",
};

describe("useSafetyMonitor hook (C4)", () => {
  let watchPositionMock: ReturnType<typeof vi.fn>;
  let clearWatchMock: ReturnType<typeof vi.fn>;
  let createAlertSpy: MockInstance;

  beforeEach(() => {
    watchPositionMock = vi.fn();
    clearWatchMock = vi.fn();

    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: watchPositionMock,
        clearWatch: clearWatchMock,
      },
    });

    createAlertSpy = vi
      .spyOn(api, "createAlert")
      .mockResolvedValue(mockAlertResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("triggers createAlert from spoken keyword transcript", async () => {
    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-1"),
    );

    monitor.handleUserTranscript("hej mamo, czy nakarmiłaś kota dzisiaj?", true);

    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledTimes(1);
    expect(createAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "session-test-1",
        level: "alert",
        source: "keyword",
        language: "pl",
        recipientName: "Ania",
        recipientPhone: "+48123456789",
        triggerPhrase: "czy nakarmiłaś kota",
      }),
    );
  });

  it("detects keyword split across consecutive transcript deltas", async () => {
    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-split"),
    );

    monitor.handleUserTranscript("czy nakar", false);
    expect(createAlertSpy).not.toHaveBeenCalled();

    monitor.handleUserTranscript("miłaś kota", false);
    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledTimes(1);
    expect(createAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "alert",
        source: "keyword",
        triggerPhrase: "czy nakarmiłaś kota",
      }),
    );
  });

  it("triggers createAlert from agent tool call", async () => {
    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-agent"),
    );

    monitor.handleToolCall("trigger_alert", {
      level: "alert",
      reason: "User said secret phrase",
    });

    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledTimes(1);
    expect(createAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "session-test-agent",
        level: "alert",
        source: "agent",
        triggerPhrase: "User said secret phrase",
      }),
    );
  });

  it("triggers createAlert manually", async () => {
    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-manual"),
    );

    monitor.triggerManually("alert");

    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledTimes(1);
    expect(createAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: "session-test-manual",
        level: "alert",
        source: "manual",
      }),
    );
  });

  it("handles emergency level correctly for keyword, tool call, and manual trigger", async () => {
    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-emergency"),
    );

    monitor.handleUserTranscript("zadzwoń do dziadka", true);
    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "emergency",
        source: "keyword",
        triggerPhrase: "zadzwoń do dziadka",
      }),
    );
  });

  it("cooldown blocks second alert of the SAME level within 30 seconds", async () => {
    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-cooldown"),
    );

    monitor.triggerManually("alert");
    monitor.triggerManually("alert");

    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledTimes(1);
  });

  it("alert and emergency have independent cooldowns", async () => {
    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-independent-cooldown"),
    );

    monitor.triggerManually("alert");
    monitor.triggerManually("emergency");

    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledTimes(2);
    expect(createAlertSpy).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ level: "alert" }),
    );
    expect(createAlertSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ level: "emergency" }),
    );
  });

  it("attaches location when geolocation is available", async () => {
    watchPositionMock.mockImplementation((success: (pos: unknown) => void) => {
      success({
        coords: {
          latitude: 50.0647,
          longitude: 19.945,
          accuracy: 12.5,
        },
      });
      return 1;
    });

    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-loc"),
    );

    monitor.triggerManually("alert");
    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        location: {
          latitude: 50.0647,
          longitude: 19.945,
          accuracy: 12.5,
        },
      }),
    );
    expect(monitor.gpsStatus).toBe("ok");
  });

  it("sends location: null when GPS is unavailable", async () => {
    watchPositionMock.mockImplementation(
      (_success: unknown, error: (err: unknown) => void) => {
        error({ code: 2, message: "Position unavailable" });
        return 2;
      },
    );

    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-no-gps"),
    );

    monitor.triggerManually("alert");
    await Promise.resolve();

    expect(createAlertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        location: null,
      }),
    );
    expect(monitor.gpsStatus).toBe("unavailable");
  });

  it("ignores invalid tool calls and does not send requests", async () => {
    const runner = createHookRunner();
    const monitor = runner.run(() =>
      useSafetyMonitor(mockSettings, "session-test-invalid"),
    );

    // Wrong name
    monitor.handleToolCall("some_other_tool", { level: "alert" });
    // Invalid level
    monitor.handleToolCall("trigger_alert", { level: "critical" });
    // Null args
    monitor.handleToolCall("trigger_alert", null);
    // Malformed JSON string
    monitor.handleToolCall("trigger_alert", "{ invalid json");

    await Promise.resolve();

    expect(createAlertSpy).not.toHaveBeenCalled();
  });
});

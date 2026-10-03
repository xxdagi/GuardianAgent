import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAlertsFeed } from "./useAlertsFeed";
import { api, type AlertListItem } from "../api";

function createHookRunner<T>(hookFn: () => T) {
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

  const ReactSharedInternals =
    // @ts-expect-error React internals for testing without react-dom test-utils
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_OR_THEY_CANNOT_UPGRADE ||
    // @ts-expect-error fallback React internals
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

  let currentResult: T;

  function render(): T {
    hookIndex = 0;
    const prevDispatcher = ReactSharedInternals.ReactCurrentDispatcher.current;
    ReactSharedInternals.ReactCurrentDispatcher.current = dispatcher;
    try {
      currentResult = hookFn();
      return currentResult;
    } finally {
      ReactSharedInternals.ReactCurrentDispatcher.current = prevDispatcher;
    }
  }

  function flushEffects() {
    while (effects.length > 0) {
      const effect = effects.shift();
      if (effect) {
        const cleanup = effect();
        if (typeof cleanup === "function") {
          cleanups.push(cleanup);
        }
      }
    }
  }

  function unmount() {
    while (cleanups.length > 0) {
      const cleanup = cleanups.pop();
      if (cleanup) cleanup();
    }
  }

  // initial render
  render();
  flushEffects();

  return {
    get result() {
      return currentResult;
    },
    rerender() {
      render();
      flushEffects();
      return currentResult;
    },
    unmount,
  };
}

const mockAlerts: AlertListItem[] = [
  {
    id: "alert-1",
    sessionId: "sess-1",
    createdAt: "2026-10-03T20:00:00.000Z",
    level: "alert",
    source: "keyword",
    triggerPhrase: "bezpiecznik",
    transcriptSnippet: "proszę o bezpiecznik",
    location: {
      latitude: 52.2297,
      longitude: 21.0122,
      accuracy: 10,
    },
    deliveries: [{ channel: "mock", status: "sent" }],
  },
  {
    id: "alert-2",
    sessionId: "sess-2",
    createdAt: "2026-10-03T20:05:00.000Z",
    level: "emergency",
    source: "agent",
    triggerPhrase: "czerwony alarm",
    transcriptSnippet: "zagrożenie życia",
    location: null,
    deliveries: [{ channel: "mock", status: "sent" }],
  },
];

describe("useAlertsFeed", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches alerts and sorts them descending by createdAt", async () => {
    vi.spyOn(api, "listAlerts").mockResolvedValue(mockAlerts);

    const runner = createHookRunner(() => useAlertsFeed());
    expect(runner.result.isLoading).toBe(true);

    // Wait for the async fetchAlerts call to resolve
    await vi.waitFor(() => {
      runner.rerender();
      expect(runner.result.isLoading).toBe(false);
    });

    expect(runner.result.alerts).toHaveLength(2);
    // alert-2 is newer (20:05 vs 20:00)
    expect(runner.result.alerts[0].id).toBe("alert-2");
    expect(runner.result.alerts[1].id).toBe("alert-1");
    expect(runner.result.error).toBeNull();
    runner.unmount();
  });

  it("handles empty alerts list", async () => {
    vi.spyOn(api, "listAlerts").mockResolvedValue([]);

    const runner = createHookRunner(() => useAlertsFeed());

    await vi.waitFor(() => {
      runner.rerender();
      expect(runner.result.isLoading).toBe(false);
    });

    expect(runner.result.alerts).toEqual([]);
    expect(runner.result.error).toBeNull();
    runner.unmount();
  });

  it("handles fetch errors gracefully", async () => {
    vi.spyOn(api, "listAlerts").mockRejectedValue(new Error("Network failure"));

    const runner = createHookRunner(() => useAlertsFeed());

    await vi.waitFor(() => {
      runner.rerender();
      expect(runner.result.isLoading).toBe(false);
    });

    expect(runner.result.alerts).toEqual([]);
    expect(runner.result.error).toBe("Network failure");
    runner.unmount();
  });

  it("detects newly arriving alerts and acknowledges them", async () => {
    const listSpy = vi.spyOn(api, "listAlerts").mockResolvedValue([mockAlerts[0]]);

    const runner = createHookRunner(() => useAlertsFeed());

    await vi.waitFor(() => {
      runner.rerender();
      expect(runner.result.isLoading).toBe(false);
    });

    expect(runner.result.hasNewAlert).toBe(false);

    // Simulate next polling call returning an additional alert
    listSpy.mockResolvedValue([mockAlerts[0], mockAlerts[1]]);

    await runner.result.refetch();
    runner.rerender();

    expect(runner.result.hasNewAlert).toBe(true);

    runner.result.acknowledgeNewAlert();
    runner.rerender();

    expect(runner.result.hasNewAlert).toBe(false);
    runner.unmount();
  });
});

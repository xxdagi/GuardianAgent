import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "./useGeolocation";

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

describe("useGeolocation hook", () => {
  let watchPositionMock: ReturnType<typeof vi.fn>;
  let clearWatchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    watchPositionMock = vi.fn();
    clearWatchMock = vi.fn();

    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: watchPositionMock,
        clearWatch: clearWatchMock,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("registers watchPosition and updates location and status on success", () => {
    watchPositionMock.mockImplementation((success: (pos: unknown) => void) => {
      success({
        coords: {
          latitude: 52.2297,
          longitude: 21.0122,
          accuracy: 10,
        },
      });
      return 101;
    });

    const runner = createHookRunner();
    const result = runner.run(() => useGeolocation());

    expect(watchPositionMock).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    );

    expect(result.gpsStatus).toBe("ok");
    expect(result.location).toEqual({
      latitude: 52.2297,
      longitude: 21.0122,
      accuracy: 10,
    });
    expect(result.locationRef.current).toEqual(result.location);
  });

  it("sets status to denied on permission denied error", () => {
    watchPositionMock.mockImplementation(
      (_success: unknown, error: (err: unknown) => void) => {
        error({ code: 1, message: "User denied Geolocation" });
        return 102;
      },
    );

    const runner = createHookRunner();
    const result = runner.run(() => useGeolocation());

    expect(result.gpsStatus).toBe("denied");
    expect(result.location).toBeNull();
  });

  it("sets status to unavailable on position unavailable or timeout errors", () => {
    watchPositionMock.mockImplementation(
      (_success: unknown, error: (err: unknown) => void) => {
        error({ code: 2, message: "Position unavailable" });
        return 103;
      },
    );

    const runner = createHookRunner();
    const result = runner.run(() => useGeolocation());

    expect(result.gpsStatus).toBe("unavailable");
  });

  it("calls clearWatch on unmount", () => {
    watchPositionMock.mockReturnValue(999);

    const runner = createHookRunner();
    runner.run(() => useGeolocation());
    runner.unmount();

    expect(clearWatchMock).toHaveBeenCalledWith(999);
  });

  it("sets status to unavailable when geolocation is not supported", () => {
    vi.stubGlobal("navigator", {});

    const runner = createHookRunner();
    const result = runner.run(() => useGeolocation());

    expect(result.gpsStatus).toBe("unavailable");
    expect(result.location).toBeNull();
  });
});

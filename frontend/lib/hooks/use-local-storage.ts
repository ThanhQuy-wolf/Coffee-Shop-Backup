"use client";

import { useCallback, useSyncExternalStore } from "react";

// ─── localStorage-backed state, hydration-safe ───────────────────────────────
//
// Built on useSyncExternalStore so that:
//   - the server render and the first client render both use `fallback`
//     (no hydration mismatch),
//   - the stored value is picked up right after hydration without a
//     setState-in-effect,
//   - every component using the same key stays in sync (also across tabs).

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function subscribe(key: string, listener: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(listener);
  const onStorage = (e: StorageEvent) => e.key === key && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.get(key)?.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function read<T>(key: string, fallback: T, validate?: (v: unknown) => T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;

  let value: T = fallback;
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      value = validate ? validate(parsed) : (parsed as T);
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function useLocalStorage<T>(
  key: string,
  fallback: T,
  validate?: (v: unknown) => T,
) {
  const value = useSyncExternalStore(
    (l) => subscribe(key, l),
    () => read(key, fallback, validate),
    () => fallback,
  );

  const setValue = useCallback(
    (next: T | null | ((prev: T) => T | null)) => {
      const prev = read(key, fallback, validate);
      const resolved =
        typeof next === "function" ? (next as (p: T) => T | null)(prev) : next;
      try {
        if (resolved === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // storage full / blocked: keep going with in-memory UI
      }
      notify(key);
    },
    // fallback/validate are expected to be stable (module constants)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue] as const;
}

const noopSubscribe = () => () => {};

/** false during SSR and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

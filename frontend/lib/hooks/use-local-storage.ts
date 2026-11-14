"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

/**
 * Re-renders every component that reads `key`.
 *
 * @param key - localStorage key that changed
 */
function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

/**
 * Registers a listener for changes of `key`, in this tab and in other tabs
 * (`storage` event).
 *
 * @param key - localStorage key to watch
 * @param listener - called after each change
 * @returns a function that removes the listener
 */
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

/**
 * Reads and parses `key`. The parsed value is cached per raw string so
 * useSyncExternalStore gets the same object until the stored text changes.
 *
 * @param key - localStorage key
 * @param fallback - value when the key is missing, unreadable or invalid JSON
 * @param validate - optional guard that turns the parsed JSON into a `T`
 * @returns the stored value or `fallback`
 */
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

/**
 * React state saved in localStorage. It is hydration-safe: the server render
 * and the first client render use `fallback`, and the stored value appears
 * right after hydration. Every component that uses the same key stays in sync,
 * also across browser tabs.
 *
 * @param key - localStorage key
 * @param fallback - value before hydration and when nothing valid is stored;
 *   keep it a module constant so its identity is stable
 * @param validate - optional guard for the parsed JSON (also a module constant)
 * @returns `[value, setValue]`; `setValue` takes a value, `null` to remove the
 *   key, or an updater `(prev) => next`
 */
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
        // Storage full or blocked: the UI keeps working, it just is not saved.
      }
      notify(key);
    },
    // fallback/validate are expected to be stable (module constants)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue] as const;
}

/** Subscription that never fires, for {@link useHydrated}. */
const noopSubscribe = () => () => {};

/**
 * Tells whether the component has hydrated, to avoid rendering data that only
 * exists in the browser (localStorage, session) during SSR.
 *
 * @returns `false` during SSR and hydration, `true` afterwards
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

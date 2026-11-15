"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Tracks the rendered width of an element, so an SVG chart can draw in real
 * pixels instead of shrinking a fixed 800-unit viewBox on a phone, which
 * made its 10px labels unreadable.
 * @param fallback Width used before the first measurement (server render).
 * @returns A ref to attach to the element and its current width in pixels.
 */
export function useElementWidth<T extends HTMLElement>(
  fallback = 800,
): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}

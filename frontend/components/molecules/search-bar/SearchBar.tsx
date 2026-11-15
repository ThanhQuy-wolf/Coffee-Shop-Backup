"use client";

import { Icon } from "@/components/atoms";

import type { SearchBarProps } from "./Search.types";

/**
 * Search field with a magnifier icon and a clear button that shows once
 * something is typed.
 * @param props.value Current text (controlled).
 * @param props.onChange Called with the new text.
 * @param props.onClear Called by the clear button.
 * @param props.placeholder Placeholder text.
 * @param props.className Extra classes for the wrapper.
 */
export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Tìm kiếm...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <Icon
        name="magnifying-glass"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-(--color-text-muted)"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-(--color-border) bg-white py-2 pr-9 pl-9 text-sm text-(--color-text-primary) transition-all duration-150 outline-none placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          title="Xóa tìm kiếm"
          aria-label="Xóa tìm kiếm"
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-(--color-text-muted) transition-colors duration-150 hover:text-(--color-primary)"
        >
          <Icon name="xmark" className="text-sm" />
        </button>
      )}
    </div>
  );
}

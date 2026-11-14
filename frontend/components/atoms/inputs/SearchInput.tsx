"use client";

import type { SearchInputProps } from "./Input.types";

export default function SearchInput({
  value,
  onChange,
  onClear,
  className = "",
  ...props
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <i className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-(--color-text-muted)"></i>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className={`w-full rounded-lg border border-(--color-border) bg-transparent py-2 pr-9 pl-9 text-sm transition-all duration-150 placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 focus:outline-none ${className}`}
        {...props}
      />
      {value && onClear && (
        <button
          title="Xóa"
          type="button"
          onClick={onClear}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
          aria-label="Xóa"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      )}
    </div>
  );
}

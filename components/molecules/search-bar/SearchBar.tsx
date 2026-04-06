"use client";

import type { SearchBarProps } from "./Search.types";

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Tìm kiếm...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <i className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-(--color-text-muted)"></i>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-card text-foreground border-border placeholder:text-muted-foreground focus:border-primary focus:ring-primary focus:ring-opacity-20 w-full rounded-xl border py-2 pr-9 pl-9 text-sm transition-all duration-150 outline-none focus:ring-2"
      />
      {value && (
        <button
          onClick={onClear}
          title="Xóa tìm kiếm"
          aria-label="Xóa tìm kiếm"
          className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 text-(--color-text-muted) transition-colors duration-150 hover:text-(--color-primary)"
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      )}
    </div>
  );
}

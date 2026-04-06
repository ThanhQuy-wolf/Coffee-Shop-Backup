"use client";

import type { TextInputProps } from "./Input.types";

export default function TextInput({
  label,
  error,
  icon,
  onIconClick,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-(--color-text-secondary)">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 focus:outline-none ${error ? "border-red-500" : ""} ${className}`}
          {...props}
        />
        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-(--color-text-muted) transition-colors hover:text-(--color-primary)"
          >
            <i className={`fa-solid ${icon}`}></i>
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

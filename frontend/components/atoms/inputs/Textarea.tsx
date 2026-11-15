"use client";

import type { TextareaProps } from "./Input.types";

/**
 * Multi-line text field with an optional label and error line. Other
 * `<textarea>` attributes are passed through.
 * @param props.label Label above the field.
 * @param props.error Error shown below the field; turns the border red.
 * @param props.className Extra classes for the textarea.
 */
export default function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-(--color-text-secondary)">
          {label}
        </label>
      )}
      <textarea
        className={`text-foreground w-full resize-none rounded-xl border border-(--color-border) bg-transparent px-3 py-2.5 text-sm transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 focus:outline-none ${error ? "border-(--color-danger)" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-(--color-danger)">{error}</p>}
    </div>
  );
}

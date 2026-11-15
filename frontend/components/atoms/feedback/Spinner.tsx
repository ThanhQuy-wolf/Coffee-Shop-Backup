import { Icon } from "../icons";

export interface SpinnerProps {
  /** Text next to the icon, e.g. "Đang tải menu...". Icon only when omitted. */
  label?: string;
  /** Icon size: `sm` inline with text, `lg` for a whole page. */
  size?: "sm" | "lg";
  /** Extra classes for the wrapper. */
  className?: string;
}

/**
 * Loading indicator: a spinning icon, optionally followed by a label.
 * It is centred, so it can stand in for a page or a section while it loads.
 * @param props.label Text shown after the icon.
 * @param props.size `lg` (default) for page loading, `sm` for inline use.
 * @param props.className Extra classes, e.g. vertical padding.
 */
export default function Spinner({
  label,
  size = "lg",
  className = "",
}: SpinnerProps) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center gap-2 text-sm text-(--color-text-muted) ${className}`}
    >
      <Icon
        name="spinner"
        className={`animate-spin text-(--color-primary) motion-reduce:animate-none ${size === "lg" ? "text-3xl" : "text-base"}`}
      />
      {label && <span>{label}</span>}
    </div>
  );
}

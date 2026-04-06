import type { CaptionProps } from "./Typography.types";

export default function Caption({
  children,
  className = "",
  ...props
}: CaptionProps) {
  return (
    <span
      className={`text-xs text-(--color-text-muted) ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

import type { CaptionProps } from "./Typography.types";

/**
 * Small muted inline text, for hints and metadata.
 * @param props.className Extra classes.
 */
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

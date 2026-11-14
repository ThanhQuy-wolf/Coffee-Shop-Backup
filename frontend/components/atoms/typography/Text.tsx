import type { TextProps } from "./Typography.types";

export default function Text({
  variant = "body1",
  children,
  className = "",
  ...props
}: TextProps) {
  const variants = {
    body1: "text-base text-(--color-text-primary)",
    body2: "text-sm text-(--color-text-secondary)",
    caption: "text-xs text-(--color-text-muted)",
    label: "text-sm font-medium text-(--color-text-secondary)",
  };

  return (
    <p className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </p>
  );
}

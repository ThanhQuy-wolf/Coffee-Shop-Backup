import type { BadgeProps } from "./Badge.types";

export default function Badge({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const variants = {
    primary: "bg-(--color-primary) text-white",
    secondary: "bg-(--color-border-light) text-(--color-text-secondary)",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

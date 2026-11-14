"use client";

import type { ButtonProps } from "./Button.types";

export default function IconButton({
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  className = "",
  children,
  style: _style,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-(--color-primary) text-white hover:bg-(--color-primary-dark) active:scale-95",
    secondary:
      "border border-(--color-border) hover:bg-(--color-border-light) active:scale-95",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
    ghost: "bg-transparent hover:bg-(--color-border-light) active:scale-95",
    primaryNoBorder:
      "bg-(--color-primary) text-white hover:bg-(--color-primary-dark) active:scale-95",
    bgWhite:
      "bg-white text-(--color-text-primary) hover:bg-gray-100 active:scale-95",
  };

  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon ? <i className={`fa-solid ${icon}`}></i> : children}
    </button>
  );
}

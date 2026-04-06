"use client";

import type { ButtonProps } from "./Button.types";

export default function Button({
  style = "base",
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const styles = {
    base: "font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5",
    payment: "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl transition-colors",
    login: "w-full cursor-pointer rounded-xl py-3 font-semibold transition-all duration-150",
  }
  
  const variants = {
    primary:
      "bg-(--color-primary) text-white hover:bg-(--color-primary-dark) active:scale-95",
    secondary:
      "border border-(--color-border) hover:bg-(--color-border-light) active:scale-95",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-95",
    ghost: "bg-transparent hover:bg-(--color-border-light) active:scale-95",
    primaryNoBorder: "border-none bg-(--color-primary) text-white hover:bg-(--color-primary-dark) active:scale-98",
    bgWhite: "border-2 border-(--color-primary) bg-white text-(--color-primary) hover:bg-(--color-primary) hover:text-white active:scale-98",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const iconClasses = "text-sm shrink-0";

  return (
    <button
      className={`${styles[style]} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <i className={`fa-solid ${icon} ${iconClasses}`}></i>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <i className={`fa-solid ${icon} ${iconClasses}`}></i>
      )}
    </button>
  );
}

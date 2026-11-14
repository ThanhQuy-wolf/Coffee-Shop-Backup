import { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning";
  size?: "sm" | "md";
  children: React.ReactNode;
}

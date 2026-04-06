import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  style?: "base" | "payment" | "login";
  variant?: "primary" | "secondary" | "danger" | "ghost" | "primaryNoBorder" | "bgWhite";
  size?: "sm" | "md" | "lg";
  icon?: string; // FontAwesome class like "fa-solid fa-cart-plus"
  iconPosition?: "left" | "right";
  disabled?: boolean;
  children: React.ReactNode;
}

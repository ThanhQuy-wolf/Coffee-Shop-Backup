import { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "style"
> {
  /** Shape preset. `base` is the default rounded button. */
  style?: "base" | "payment" | "login";
  /** Colour preset. */
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "ghost"
    | "primaryNoBorder"
    | "bgWhite";
  /** Padding and font size. */
  size?: "sm" | "md" | "lg";
  /** FontAwesome icon name; `fa-solid` is added for you, e.g. `fa-cart-plus`. */
  icon?: string;
  /** Side of the label the icon goes on, `left` by default. */
  iconPosition?: "left" | "right";
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

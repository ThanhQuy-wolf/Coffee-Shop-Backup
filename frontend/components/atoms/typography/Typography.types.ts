import { HTMLAttributes } from "react";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level, which picks both the tag and the size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Text style. */
  variant?: "body1" | "body2" | "caption" | "label";
  children: React.ReactNode;
}

export interface CaptionProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

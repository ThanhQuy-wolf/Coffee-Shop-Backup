import type React from "react";

import type { HeadingProps } from "./Typography.types";

/**
 * Heading that renders `<h1>`–`<h6>` with the matching app font size.
 * @param props.level Heading level, 2 by default.
 * @param props.className Extra classes.
 */
export default function Heading({
  level = 2,
  children,
  className = "",
  ...props
}: HeadingProps) {
  const sizes = {
    1: "text-3xl font-bold",
    2: "text-2xl font-bold",
    3: "text-xl font-bold",
    4: "text-lg font-semibold",
    5: "text-base font-semibold",
    6: "text-sm font-semibold",
  };

  const Tag = `h${level}` as React.ElementType;

  return (
    <Tag className={`text-foreground ${sizes[level]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

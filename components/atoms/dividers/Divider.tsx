import { HTMLAttributes } from "react";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export default function Divider({
  orientation = "horizontal",
  className = "",
  ...props
}: DividerProps) {
  return (
    <hr
      className={`border-(--color-border) ${
        orientation === "horizontal" ? "border-t" : "h-full border-l"
      } ${className}`}
      {...props}
    />
  );
}

import { Icon } from "@/components/atoms";
import Link from "next/link";

export interface EmptyStateProps {
  /** Icon name for the `Icon` atom, e.g. `cart-shopping`. */
  icon: string;
  /** Short headline, e.g. "Giỏ hàng đang trống". */
  title: string;
  /** One sentence on what to do next. */
  description?: string;
  /** Optional call to action rendered as a button-styled link. */
  action?: { href: string; label: string };
  /** `sm` for a section inside a page, `lg` (default) for a whole page. */
  size?: "sm" | "lg";
  /** Extra classes, e.g. `col-span-full` inside a grid. */
  className?: string;
}

/**
 * Placeholder shown when a list or page has nothing to display: an icon in a
 * soft circle, a headline, a hint and an optional link to the next step.
 * @param props.icon Icon name.
 * @param props.title Headline.
 * @param props.description Hint below the headline.
 * @param props.action Link to the next step.
 * @param props.size `lg` for a page, `sm` for a section.
 * @param props.className Extra classes for the wrapper.
 * @returns The empty state block.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  size = "lg",
  className = "",
}: EmptyStateProps) {
  const large = size === "lg";
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${large ? "gap-3 py-20" : "gap-2 py-12"} ${className}`}
    >
      <span
        className={`flex items-center justify-center rounded-full bg-(--color-accent-light) text-(--color-primary) ${large ? "h-16 w-16 text-2xl" : "h-12 w-12 text-xl"}`}
      >
        <Icon name={icon} />
      </span>
      <p
        className={`text-foreground font-semibold ${large ? "text-base" : "text-sm"}`}
      >
        {title}
      </p>
      {description && (
        <p className="max-w-sm text-sm text-(--color-text-muted)">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-(--color-primary-dark)"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

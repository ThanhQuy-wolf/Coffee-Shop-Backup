import Image from "next/image";
import Link from "next/link";

import type { FeedLayoutProps } from "./FeedLayout.types";

/**
 * Feed layout template — custom minimal header (Drinkool brand, no auth button).
 * Used by the (feed) route group.
 */
export default function FeedLayout({ children }: FeedLayoutProps) {
  return (
    <>
      {/* Custom Drinkool header — no login button */}
      <header className="sticky top-0 z-50 h-(--spacing-header-height) w-full border-b border-(--color-border) bg-(--color-bg-header) shadow-[0_1px_8px_var(--color-shadow-sm)]">
        <div className="mx-auto flex h-full max-w-screen-2xl items-center gap-4 px-6 md:px-8 lg:px-12">
          <Link
            href="/feed"
            className="group flex shrink-0 items-center gap-3 no-underline"
          >
            <div className="relative h-10 w-10 shrink-0 md:h-11 md:w-11">
              <Image
                src="/imgs/logo.png"
                alt="Logo Drinkool"
                fill
                className="object-contain transition-transform duration-200 group-hover:scale-105"
                sizes="44px"
                priority
              />
            </div>
            <span className="text-lg font-bold text-(--color-primary-dark) transition-colors duration-150 group-hover:text-(--color-primary) md:text-xl">
              Drinkool
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1">{children}</div>
    </>
  );
}

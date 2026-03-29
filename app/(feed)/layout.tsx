import Image from "next/image";
import Link from "next/link";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Custom Drinkool header — no login button */}
      <header
        className="w-full sticky top-0 z-50
                   bg-(--color-bg-header) border-b border-(--color-border)
                   shadow-[0_1px_8px_var(--color-shadow-sm)]
                   h-(--spacing-header-height)"
      >
        <div
          className="h-full px-6 md:px-8 lg:px-12
                     flex items-center gap-4
                     max-w-screen-2xl mx-auto"
        >
          <Link
            href="/feed"
            className="flex items-center gap-3 shrink-0 no-underline group"
          >
            {/* Logo */}
            <div className="relative w-10 h-10 md:w-11 md:h-11 shrink-0">
              <Image
                src="/imgs/logo.png"
                alt="Logo Drinkool"
                fill
                className="object-contain transition-transform duration-200 group-hover:scale-105"
                sizes="44px"
                priority
              />
            </div>

            {/* Brand name */}
            <span
              className="font-bold text-lg md:text-xl
                         text-(--color-primary-dark)
                         group-hover:text-(--color-primary)
                         transition-colors duration-150"
            >
              Drinkool
            </span>
          </Link>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1">{children}</div>

      {/* No footer */}
    </>
  );
}

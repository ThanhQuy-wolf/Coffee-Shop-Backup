import { PLATFORM_INFO, SOCIAL_LINKS } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

/**
 * Site Footer — 3-section 12-column grid.
 *
 * Platform-level footer. Shop details (address, hours, WiFi) are on each
 * shop's menu page, since the platform hosts many shops.
 */
export default function Footer() {
  return (
    <footer className="w-full overflow-x-hidden bg-(--color-bg-footer) text-(--color-text-on-dark)">
      {/* ── Main grid ── */}
      <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">
          {/* ── 1. Brand info ── */}
          <div className="col-span-12 md:col-span-6 lg:col-span-8 xl:col-span-6">
            {/* Logo + name */}
            <div className="mb-3 flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src={PLATFORM_INFO.logo}
                  alt={`Logo ${PLATFORM_INFO.name}`}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="text-lg font-bold text-(--color-accent)">
                {PLATFORM_INFO.name}
              </span>
            </div>

            {/* Tagline */}
            <p className="mb-4 text-sm leading-relaxed opacity-75">
              {PLATFORM_INFO.tagline}
            </p>

            {/* Contact details */}
            <ul className="flex flex-col gap-2 text-sm opacity-80">
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-phone w-4 shrink-0 text-center text-(--color-accent)"></i>
                <a
                  href={`tel:${PLATFORM_INFO.phone}`}
                  className="transition-colors duration-150 hover:text-(--color-accent)"
                >
                  Hỗ trợ: {PLATFORM_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-envelope w-4 shrink-0 text-center text-(--color-accent)"></i>
                <a
                  href={`mailto:${PLATFORM_INFO.email}`}
                  className="transition-colors duration-150 hover:text-(--color-accent)"
                >
                  Email: {PLATFORM_INFO.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-12 grid grid-cols-1 gap-6 md:col-span-6 lg:col-span-4 xl:col-span-6">
            <div className="col-span-1">
              <h3 className="mb-4 text-sm font-bold tracking-wider text-(--color-accent) uppercase">
                Kết nối
              </h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm opacity-75 transition-all duration-150 hover:text-(--color-accent) hover:opacity-100"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1877F2] text-base text-white">
                      <i className="fa-brands fa-facebook-f"></i>
                    </span>
                    Facebook
                  </a>
                </li>
                <li>
                  <a
                    href={SOCIAL_LINKS.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm opacity-75 transition-all duration-150 hover:text-(--color-accent) hover:opacity-100"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-base text-white">
                      <i className="fa-brands fa-tiktok"></i>
                    </span>
                    TikTok
                  </a>
                </li>
                <li>
                  <Link
                    href={SOCIAL_LINKS.website}
                    className="flex items-center gap-3 text-sm opacity-75 transition-all duration-150 hover:text-(--color-accent) hover:opacity-100"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-primary) text-base text-white">
                      <i className="fa-solid fa-globe"></i>
                    </span>
                    Website
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-opacity-10 border-t border-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs opacity-50 sm:flex-row md:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} {PLATFORM_INFO.name}. All rights
            reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

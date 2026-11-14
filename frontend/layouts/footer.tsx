import { SHOP_INFO, SOCIAL_LINKS } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

/**
 * Site Footer — 3-section 12-column grid.
 *
 * Sections:
 *   1. Brand info (logo, name, tagline, address, phone, hours)
 *   2. Social links (Facebook, TikTok, Website)
 *   3. WiFi card (network name + password)
 *
 * Responsive:
 *   - Mobile  : all sections stack full-width (col-span-12)
 *   - md      : brand 6 cols | social 3 | wifi 3
 *   - lg      : brand 5 cols | social 3 | wifi 4
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
                  src={SHOP_INFO.logo}
                  alt={`Logo ${SHOP_INFO.name}`}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="text-lg font-bold text-(--color-accent)">
                {SHOP_INFO.name}
              </span>
            </div>

            {/* Tagline */}
            <p className="mb-4 text-sm leading-relaxed opacity-75">
              {SHOP_INFO.tagline}
            </p>

            {/* Contact details */}
            <ul className="flex flex-col gap-2 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot mt-0.5 w-4 shrink-0 text-center text-(--color-accent)"></i>
                <span>Địa chỉ: {SHOP_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-phone w-4 shrink-0 text-center text-(--color-accent)"></i>
                <a
                  href={`tel:${SHOP_INFO.phone}`}
                  className="transition-colors duration-150 hover:text-(--color-accent)"
                >
                  Số điện thoại: {SHOP_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-envelope w-4 shrink-0 text-center text-(--color-accent)"></i>
                <a
                  href={`mailto:${SHOP_INFO.email}`}
                  className="transition-colors duration-150 hover:text-(--color-accent)"
                >
                  Email: {SHOP_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-clock w-4 shrink-0 text-center text-(--color-accent)"></i>
                <span>Open: {SHOP_INFO.openHours}</span>
              </li>
            </ul>
          </div>

          {/* ── Right column: Social + WiFi
               md : side-by-side (each half of the 6-col right block)
               lg : stacked (WiFi below Social, both full width of the 4-col block)
          ── */}
          <div className="col-span-12 grid grid-cols-1 gap-6 md:col-span-6 lg:col-span-4 xl:col-span-6 xl:grid-cols-2">
            {/* ── 2. Social links ── */}
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

            {/* ── 3. WiFi card ── */}
            <div className="col-span-1">
              <h3 className="mb-4 text-sm font-bold tracking-wider text-(--color-accent) uppercase">
                WiFi Miễn Phí
              </h3>
              <div className="border-opacity-50 bg-opacity-30 rounded-xl border border-(--color-primary-light) bg-(--color-primary-dark) p-4">
                <div className="mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-wifi shrink-0 text-lg text-(--color-accent)"></i>
                  <span className="text-sm font-semibold">
                    Kết nối miễn phí
                  </span>
                </div>
                {/* Stacked label + value rows — no overflow risk */}
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs tracking-wide uppercase opacity-60">
                      Tên mạng
                    </span>
                    <span className="border-opacity-30 rounded border border-(--color-accent) px-2 py-1 font-mono font-bold break-all text-(--color-accent)">
                      {SHOP_INFO.wifi.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs tracking-wide uppercase opacity-60">
                      Mật khẩu
                    </span>
                    <span className="border-opacity-30 rounded border border-(--color-accent) px-2 py-1 font-mono font-bold tracking-wider break-all text-(--color-accent)">
                      {SHOP_INFO.wifi.password}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-opacity-10 border-t border-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs opacity-50 sm:flex-row md:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} {SHOP_INFO.name}. All rights reserved.
          </span>
          <span className="flex items-center gap-1">
            Được vận hành{" "}
            <i className="fa-solid fa-heart mx-1 text-(--color-accent)"></i>{" "}
            bằng Drinkool
          </span>
        </div>
      </div>
    </footer>
  );
}

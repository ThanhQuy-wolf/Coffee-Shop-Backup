import Image from "next/image";
import Link from "next/link";
import { SHOP_INFO, SOCIAL_LINKS } from "@/lib/constants";

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
    <footer className="w-full bg-(--color-bg-footer) text-(--color-text-on-dark) overflow-x-hidden">
      {/* ── Main grid ── */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">

          {/* ── 1. Brand info ── */}
          <div className="col-span-12 md:col-span-6 lg:col-span-8 xl:col-span-6">
            {/* Logo + name */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={SHOP_INFO.logo}
                  alt={`Logo ${SHOP_INFO.name}`}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="font-bold text-lg text-(--color-accent)">
                {SHOP_INFO.name}
              </span>
            </div>

            {/* Tagline */}
            <p className="text-sm opacity-75 leading-relaxed mb-4">
              {SHOP_INFO.tagline}
            </p>

            {/* Contact details */}
            <ul className="flex flex-col gap-2 text-sm opacity-80">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot mt-0.5 w-4 text-center text-(--color-accent) shrink-0"></i>
                <span>Địa chỉ: {SHOP_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-phone w-4 text-center text-(--color-accent) shrink-0"></i>
                <a
                  href={`tel:${SHOP_INFO.phone}`}
                  className="hover:text-(--color-accent) transition-colors duration-150"
                >
                  Số điện thoại: {SHOP_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-envelope w-4 text-center text-(--color-accent) shrink-0"></i>
                <a
                  href={`mailto:${SHOP_INFO.email}`}
                  className="hover:text-(--color-accent) transition-colors duration-150"
                >
                  Email: {SHOP_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-clock w-4 text-center text-(--color-accent) shrink-0"></i>
                <span>Open: {SHOP_INFO.openHours}</span>
              </li>
            </ul>
          </div>

          {/* ── Right column: Social + WiFi
               md : side-by-side (each half of the 6-col right block)
               lg : stacked (WiFi below Social, both full width of the 4-col block)
          ── */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-6 grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* ── 2. Social links ── */}
            <div className="col-span-1">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-(--color-accent)">
                Kết nối
              </h3>
              <ul className="flex flex-col gap-3">
                <li>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm opacity-75 hover:opacity-100
                               hover:text-(--color-accent) transition-all duration-150"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                 bg-[#1877F2] text-white text-base"
                    >
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
                    className="flex items-center gap-3 text-sm opacity-75 hover:opacity-100
                               hover:text-(--color-accent) transition-all duration-150"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                 bg-black text-white text-base"
                    >
                      <i className="fa-brands fa-tiktok"></i>
                    </span>
                    TikTok
                  </a>
                </li>
                <li>
                  <Link
                    href={SOCIAL_LINKS.website}
                    className="flex items-center gap-3 text-sm opacity-75 hover:opacity-100
                               hover:text-(--color-accent) transition-all duration-150"
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                 bg-(--color-primary) text-white text-base"
                    >
                      <i className="fa-solid fa-globe"></i>
                    </span>
                    Website
                  </Link>
                </li>
              </ul>
            </div>

            {/* ── 3. WiFi card ── */}
            <div className="col-span-1">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-(--color-accent)">
                WiFi Miễn Phí
              </h3>
              <div
                className="rounded-xl border border-(--color-primary-light) border-opacity-50
                           p-4 bg-(--color-primary-dark) bg-opacity-30"
              >
                <div className="flex items-center gap-2 mb-3">
                  <i className="fa-solid fa-wifi text-(--color-accent) text-lg shrink-0"></i>
                  <span className="font-semibold text-sm">Kết nối miễn phí</span>
                </div>
                {/* Stacked label + value rows — no overflow risk */}
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="opacity-60 text-xs uppercase tracking-wide">Tên mạng</span>
                    <span
                      className="font-mono font-bold text-(--color-accent)
                                 px-2 py-1 rounded border border-(--color-accent)
                                 border-opacity-30 break-all"
                    >
                      {SHOP_INFO.wifi.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="opacity-60 text-xs uppercase tracking-wide">Mật khẩu</span>
                    <span
                      className="font-mono font-bold text-(--color-accent) tracking-wider
                                 px-2 py-1 rounded border border-(--color-accent)
                                 border-opacity-30 break-all"
                    >
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
      <div className="border-t border-white border-opacity-10">
        <div
          className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4
                     flex flex-col sm:flex-row items-center justify-between gap-2
                     text-xs opacity-50"
        >
          <span>
            © {new Date().getFullYear()} {SHOP_INFO.name}. All rights reserved.
          </span>
          <span className="flex items-center gap-1">
            Được vận hành {" "}
            <i className="fa-solid fa-heart text-(--color-accent) mx-1"></i>{" "}
            bằng Drinkool
          </span>
        </div>
      </div>
    </footer>
  );
}

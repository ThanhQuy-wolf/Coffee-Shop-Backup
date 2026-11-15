"use client";

import { Icon } from "@/components/atoms";
import { BRAND } from "@/lib/constants";
import { shopService } from "@/lib/services";
import type { ShopInfo } from "@/lib/types";
import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Site footer with the shop's contact details (S-2). Shows only the brand
 * until shop_info has loaded.
 */
export default function Footer() {
  const [shop, setShop] = useState<ShopInfo | null>(null);

  useEffect(() => {
    shopService.get().then(setShop, () => setShop(null));
  }, []);

  const name = shop?.name ?? BRAND.name;

  return (
    <footer className="w-full overflow-x-hidden bg-(--color-bg-footer) text-(--color-text-on-dark)">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-x-8 gap-y-8">
          <div className="col-span-12 md:col-span-6 lg:col-span-8 xl:col-span-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src={BRAND.logo}
                  alt={`Logo ${name}`}
                  fill
                  className="object-contain"
                  sizes="40px"
                />
              </div>
              <span className="text-lg font-bold text-(--color-accent)">
                {name}
              </span>
            </div>

            <p className="mb-4 text-sm leading-relaxed opacity-75">
              {shop?.tagline ?? BRAND.tagline}
            </p>

            {shop && (
              <ul className="flex flex-col gap-2 text-sm opacity-80">
                <li className="flex items-center gap-2">
                  <Icon
                    name="location-dot"
                    className="w-4 shrink-0 text-center text-(--color-accent)"
                  />
                  {shop.address}
                </li>
                <li className="flex items-center gap-2">
                  <Icon
                    name="clock"
                    className="w-4 shrink-0 text-center text-(--color-accent)"
                  />
                  {shop.openHours}
                </li>
                <li className="flex items-center gap-2">
                  <Icon
                    name="phone"
                    className="w-4 shrink-0 text-center text-(--color-accent)"
                  />
                  <a
                    href={`tel:${shop.phone}`}
                    className="transition-colors duration-150 hover:text-(--color-accent)"
                  >
                    {shop.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Icon
                    name="envelope"
                    className="w-4 shrink-0 text-center text-(--color-accent)"
                  />
                  <a
                    href={`mailto:${shop.email}`}
                    className="transition-colors duration-150 hover:text-(--color-accent)"
                  >
                    {shop.email}
                  </a>
                </li>
              </ul>
            )}
          </div>

          {shop && (
            <div className="col-span-12 md:col-span-6 lg:col-span-4 xl:col-span-6">
              <h3 className="mb-4 text-sm font-bold tracking-wider text-(--color-accent) uppercase">
                Kết nối
              </h3>
              <ul className="flex flex-col gap-3">
                {shop.socialLinks.facebook && (
                  <li>
                    <a
                      href={shop.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm opacity-75 transition-all duration-150 hover:text-(--color-accent) hover:opacity-100"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1877F2] text-base text-white">
                        <Icon name="facebook-f" />
                      </span>
                      Facebook
                    </a>
                  </li>
                )}
                {shop.socialLinks.tiktok && (
                  <li>
                    <a
                      href={shop.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm opacity-75 transition-all duration-150 hover:text-(--color-accent) hover:opacity-100"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-base text-white">
                        <Icon name="tiktok" />
                      </span>
                      TikTok
                    </a>
                  </li>
                )}
                {shop.socialLinks.website && (
                  <li>
                    <a
                      href={shop.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm opacity-75 transition-all duration-150 hover:text-(--color-accent) hover:opacity-100"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-primary) text-base text-white">
                        <Icon name="globe" />
                      </span>
                      Website
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-opacity-10 border-t border-white">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs opacity-50 sm:flex-row md:px-6 lg:px-8">
          <span>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

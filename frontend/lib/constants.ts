// App-wide constants (real config, not mock data). Shop-specific data comes
// from the API (shopService).
import type { SocialLinks } from "./types";

/** The platform itself; each shop has its own info on its menu page */
export const PLATFORM_INFO = {
  name: "Drinkool",
  tagline: "Đặt đồ uống tại quán yêu thích, không cần xếp hàng",
  logo: "/imgs/logo.png",
  email: "hotro@drinkool.vn",
  phone: "1900 0000",
};

export const SOCIAL_LINKS: Required<SocialLinks> = {
  facebook: "https://facebook.com/drinkool",
  tiktok: "https://tiktok.com/@drinkool",
  website: "/feed",
};

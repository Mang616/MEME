export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://meme.example.com";
export const ORDER_SITE_URL = process.env.NEXT_PUBLIC_ORDER_SITE_URL ?? "/download";

export const SITE_NAME = "迷因电竞 MEME";
export const SITE_NAME_SHORT = "迷因电竞";

export const ASSETS = {
  logo: "/assets/meme-logo-96.png",
  huhang: "/assets/home-huhang-320.png",
  peiwan: "/assets/home-peiwan-320.png",
} as const;

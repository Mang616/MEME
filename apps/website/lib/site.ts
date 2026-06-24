export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://meme.example.com";

/** 外部下单站地址（「打开下单网站」按钮跳转目标） */
export const ORDER_WEB_URL =
  process.env.NEXT_PUBLIC_ORDER_SITE_URL ?? "https://order.meme.example.com";

export const SITE_NAME = "迷因电竞 MEME";
export const SITE_NAME_SHORT = "迷因电竞";

export const ROUTES = {
  home: "/",
  about: "/#about",
  order: "/order",
  download: "/download",
  miniProgram: "/mini-program",
} as const;

export const ASSETS = {
  logo: "/assets/meme-logo-96.png",
  huhang: "/assets/home-huhang-320.png",
  peiwan: "/assets/home-peiwan-320.png",
} as const;

export function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

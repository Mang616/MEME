export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://memepw.top";

/** 下单页（官网内路径，与 config/domains.json production.order 一致） */
export const ORDER_WEB_URL =
  process.env.NEXT_PUBLIC_ORDER_SITE_URL ?? "https://memepw.top/order";

/** 公开 API 根路径（无 /api 后缀） */
export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? "https://api.memepw.top";

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
  /** Pepe meme 风 Hero 插画（thepepecoin.org 同源素材，已本地化） */
  pepeThinking: "/assets/pepe-thinking.png",
  pepeHero: "/assets/pepe-hero.png",
  /** 与小程序 navigation-bar 主题切换图标一致 */
  themeDark: "/assets/theme-dark.png",
  themeLight: "/assets/theme-light.png",
} as const;

export function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

import { ROUTES } from "@/lib/site";

export type NavLink = {
  href: string;
  label: string;
};

/** 顶栏与抽屉导航项 */
export const SITE_NAV_LINKS: NavLink[] = [
  { href: ROUTES.home, label: "首页" },
  { href: "#roadmap", label: "怎么玩" },
  { href: ROUTES.about, label: "关于" },
];

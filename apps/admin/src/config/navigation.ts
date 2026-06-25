import {
  IconApps,
  IconFile,
  IconImage,
  IconNotification,
  IconUser,
  IconUserGroup,
} from "@arco-design/web-react/icon";
import type { ComponentType } from "react";
import AnnouncementsPage from "@/pages/content/announcements";
import BannersPage from "@/pages/content/banners";
import HandlersPage from "@/pages/handlers";
import OrdersPage from "@/pages/orders";
import ProductsPage from "@/pages/products";
import UsersPage from "@/pages/users";

export type NavItem = {
  path: string;
  label: string;
  icon: ComponentType;
  element: ComponentType;
};

export type NavGroup = {
  key?: string;
  label?: string;
  icon?: ComponentType;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { path: "orders", label: "订单管理", icon: IconFile, element: OrdersPage },
      { path: "products", label: "商品管理", icon: IconApps, element: ProductsPage },
      { path: "handlers", label: "打手管理", icon: IconUserGroup, element: HandlersPage },
      { path: "users", label: "用户管理", icon: IconUser, element: UsersPage },
    ],
  },
  {
    key: "content",
    label: "内容管理",
    icon: IconImage,
    items: [
      { path: "content/banners", label: "Banner 管理", icon: IconImage, element: BannersPage },
      {
        path: "content/announcements",
        label: "公告管理",
        icon: IconNotification,
        element: AnnouncementsPage,
      },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function resolveNavPath(pathname: string) {
  const match = NAV_ITEMS.find((item) => pathname.startsWith(`/${item.path}`));
  return match ? `/${match.path}` : "/orders";
}

export function contentMenuOpen(pathname: string) {
  return pathname.startsWith("/content/") ? ["content"] : undefined;
}

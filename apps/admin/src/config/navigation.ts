import {
  IconApps,
  IconCustomerService,
  IconDashboard,
  IconExclamationCircle,
  IconFile,
  IconFolder,
  IconGift,
  IconIdcard,
  IconImage,
  IconNotification,
  IconStorage,
  IconTag,
  IconThunderbolt,
  IconUser,
  IconUserGroup,
  IconSafe,
  IconStar,
} from "@arco-design/web-react/icon";
import type { ComponentType } from "react";
import { canWatchMyOrders } from "@/lib/order-routing";
import type { AdminPermission } from "@/lib/session";
import AfterSalesOrdersPage from "@/pages/after-sales/orders";
import AnalyticsPage from "@/pages/analytics";
import AnnouncementsPage from "@/pages/content/announcements";
import BannersPage from "@/pages/content/banners";
import VipConfigPage from "@/pages/content/vip-config";
import VipActivityPage from "@/pages/activities/vip";
import CouponsPage from "@/pages/activities/coupons";
import RegisterActivityPage from "@/pages/activities/register";
import InviteActivityPage from "@/pages/activities/invite";
import CategoriesPage from "@/pages/categories";
import ProductTagsPage from "@/pages/product-tags";
import HandlersPage from "@/pages/handlers";
import CompanionsPage from "@/pages/companions";
import ClubsPage from "@/pages/clubs";
import OperationsPage from "@/pages/operations";
import OrderHallPage from "@/pages/hall";
import OrdersPage from "@/pages/orders";
import MyOrdersPage from "@/pages/orders/mine";
import OrderDispatchPage from "@/pages/orders/dispatch";
import ProductsPage from "@/pages/products";
import ServiceChatsPage from "@/pages/service/chats";
import ServiceFeedbacksPage from "@/pages/service/feedbacks";
import UsersPage from "@/pages/users";
import PermissionsPage from "@/pages/system/permissions";
import StaffUsersPage from "@/pages/system/staff";
import RolesPage from "@/pages/system/roles";

export type NavMenuBadge = "hall" | "chatUnread" | "myOrders";

export type NavItem = {
  path: string;
  label: string;
  icon: ComponentType;
  element: ComponentType;
  /** 可见所需权限，满足任一即可 */
  permissions: AdminPermission[];
  /** 侧栏独立高亮入口（如接单大厅） */
  featured?: boolean;
  /** 侧栏角标：待抢单数 / 会话未读红点 */
  navBadge?: NavMenuBadge;
};

export type NavGroup = {
  key?: string;
  label?: string;
  icon?: ComponentType;
  items: NavItem[];
  /** 子菜单标题上的未读红点（如客服中心） */
  groupBadge?: NavMenuBadge;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        path: "hall",
        label: "接单大厅",
        icon: IconThunderbolt,
        element: OrderHallPage,
        permissions: ["orders.accept"],
        featured: true,
        navBadge: "hall",
      },
    ],
  },
  {
    key: "operations-center",
    label: "运营中心",
    icon: IconDashboard,
    items: [
      {
        path: "operations",
        label: "运营概览",
        icon: IconDashboard,
        element: OperationsPage,
        permissions: ["operations.read"],
      },
      {
        path: "analytics",
        label: "数据看板",
        icon: IconStorage,
        element: AnalyticsPage,
        permissions: ["analytics.read"],
      },
    ],
  },
  {
    key: "orders",
    label: "订单履约",
    icon: IconFile,
    items: [
      {
        path: "orders/mine",
        label: "我的订单",
        icon: IconUser,
        element: MyOrdersPage,
        permissions: ["orders.mine"],
        navBadge: "myOrders",
      },
      {
        path: "orders/dispatch",
        label: "订单派单",
        icon: IconCustomerService,
        element: OrderDispatchPage,
        permissions: ["orders.dispatch", "orders.write"],
      },
      {
        path: "orders",
        label: "订单列表",
        icon: IconFile,
        element: OrdersPage,
        permissions: ["orders.read"],
      },
    ],
  },
  {
    key: "catalog",
    label: "商品中心",
    icon: IconApps,
    items: [
      {
        path: "products",
        label: "商品管理",
        icon: IconApps,
        element: ProductsPage,
        permissions: ["products.read"],
      },
      {
        path: "categories",
        label: "分类管理",
        icon: IconFolder,
        element: CategoriesPage,
        permissions: ["categories.read"],
      },
      {
        path: "product-tags",
        label: "标签管理",
        icon: IconTag,
        element: ProductTagsPage,
        permissions: ["product_tags.read"],
      },
    ],
  },
  {
    key: "people",
    label: "人员管理",
    icon: IconUserGroup,
    items: [
      {
        path: "clubs",
        label: "俱乐部管理",
        icon: IconSafe,
        element: ClubsPage,
        permissions: ["clubs.read"],
      },
      {
        path: "handlers",
        label: "打手管理",
        icon: IconUserGroup,
        element: HandlersPage,
        permissions: ["handlers.read"],
      },
      {
        path: "companions",
        label: "陪玩管理",
        icon: IconCustomerService,
        element: CompanionsPage,
        permissions: ["handlers.read"],
      },
      {
        path: "users",
        label: "用户管理",
        icon: IconUser,
        element: UsersPage,
        permissions: ["users.read"],
      },
    ],
  },
  {
    key: "service",
    label: "客服中心",
    icon: IconCustomerService,
    groupBadge: "chatUnread",
    items: [
      {
        path: "service/chats",
        label: "会话管理",
        icon: IconCustomerService,
        element: ServiceChatsPage,
        permissions: ["chats.service", "chats.player"],
        navBadge: "chatUnread",
      },
      {
        path: "service/feedbacks",
        label: "意见反馈",
        icon: IconNotification,
        element: ServiceFeedbacksPage,
        permissions: ["feedbacks.read"],
      },
      {
        path: "after-sales/orders",
        label: "售后工单",
        icon: IconExclamationCircle,
        element: AfterSalesOrdersPage,
        permissions: ["after_sales.read"],
      },
    ],
  },
  {
    key: "activities",
    label: "活动管理",
    icon: IconGift,
    items: [
      {
        path: "activities/vip",
        label: "VIP 活动管理",
        icon: IconStar,
        element: VipActivityPage,
        permissions: ["content.read"],
      },
      {
        path: "activities/coupons",
        label: "优惠券管理",
        icon: IconTag,
        element: CouponsPage,
        permissions: ["content.read"],
      },
      {
        path: "activities/register",
        label: "注册活动管理",
        icon: IconIdcard,
        element: RegisterActivityPage,
        permissions: ["content.read"],
      },
      {
        path: "activities/invite",
        label: "邀请活动管理",
        icon: IconUserGroup,
        element: InviteActivityPage,
        permissions: ["content.read"],
      },
    ],
  },
  {
    key: "content",
    label: "内容管理",
    icon: IconImage,
    items: [
      {
        path: "content/banners",
        label: "Banner 管理",
        icon: IconImage,
        element: BannersPage,
        permissions: ["content.read"],
      },
      {
        path: "content/announcements",
        label: "公告管理",
        icon: IconNotification,
        element: AnnouncementsPage,
        permissions: ["content.read"],
      },
      {
        path: "content/vip-config",
        label: "VIP 等级配置",
        icon: IconStar,
        element: VipConfigPage,
        permissions: ["content.read"],
      },
    ],
  },
  {
    key: "system",
    label: "系统管理",
    icon: IconSafe,
    items: [
      {
        path: "system/roles",
        label: "角色管理",
        icon: IconIdcard,
        element: RolesPage,
        permissions: ["admin_users.read"],
      },
      {
        path: "system/permissions",
        label: "权限管理",
        icon: IconSafe,
        element: PermissionsPage,
        permissions: ["admin_users.read"],
      },
      {
        path: "system/staff",
        label: "后台用户",
        icon: IconUser,
        element: StaffUsersPage,
        permissions: ["admin_users.read"],
      },
    ],
  },
];

/** 按菜单定义顺序展开；子路径优先（如 orders/hall 在 orders 前） */
export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export const NAV_PERMISSION_MAP: Record<string, AdminPermission[]> = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.path, item.permissions]),
);

export function canAccessNav(path: string, hasAny: (perms: AdminPermission[]) => boolean) {
  const required = NAV_PERMISSION_MAP[path];
  if (!required?.length) return true;
  if (!hasAny(required)) return false;
  if (path === "orders/mine") return canWatchMyOrders();
  return true;
}

export function filterNavGroups(hasAny: (perms: AdminPermission[]) => boolean): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessNav(item.path, hasAny)),
  })).filter((group) => group.items.length > 0);
}

export function filterNavItems(hasAny: (perms: AdminPermission[]) => boolean): NavItem[] {
  return filterNavGroups(hasAny).flatMap((group) => group.items);
}

export function resolveDefaultNavPath(hasAny: (perms: AdminPermission[]) => boolean) {
  const items = filterNavItems(hasAny);
  return items[0] ? `/${items[0].path}` : "/login";
}

export function resolveNavPath(pathname: string) {
  const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length);
  const match = sorted.find((item) => pathname.startsWith(`/${item.path}`));
  return match ? `/${match.path}` : "/operations";
}

export function resolveOpenMenuKeys(pathname: string) {
  const keys = NAV_GROUPS.filter(
    (group) =>
      group.key &&
      group.items.some((item) => pathname.startsWith(`/${item.path}`)),
  )
    .map((group) => group.key!)
    .filter(Boolean);

  return keys.length ? keys : undefined;
}

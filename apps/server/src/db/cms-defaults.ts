import type { Announcement, AppUser, Banner, Database } from "../types.js";

export const DEFAULT_USERS: AppUser[] = [
  {
    id: "u1",
    nickname: "麦当劳到了",
    phone: "13800138001",
    avatar: "/assets/profile/boys.webp",
    vipLevel: 3,
    balance: 128.5,
    status: "active",
    registeredAt: "2026-01-10 12:00:00",
    lastLoginAt: "2026-05-24 15:30:00",
  },
  {
    id: "u2",
    nickname: "玩家A",
    phone: "13800138002",
    avatar: "/assets/profile/boys.webp",
    vipLevel: 1,
    balance: 0,
    status: "active",
    registeredAt: "2026-02-15 09:00:00",
    lastLoginAt: "2026-05-23 09:00:00",
  },
  {
    id: "u3",
    nickname: "老玩家88",
    phone: "13800138003",
    avatar: "/assets/profile/girls.webp",
    vipLevel: 5,
    balance: 520,
    status: "active",
    registeredAt: "2025-12-01 18:00:00",
    lastLoginAt: "2026-05-20 18:00:00",
  },
  {
    id: "u4",
    nickname: "萌新001",
    phone: "13800138004",
    avatar: "/assets/profile/boys.webp",
    vipLevel: 0,
    balance: 0,
    status: "disabled",
    registeredAt: "2026-05-01 10:00:00",
    lastLoginAt: "2026-05-18 10:30:00",
  },
];

export const DEFAULT_BANNERS: Banner[] = [
  {
    id: "b1",
    title: "迷因电竞",
    subtitle: "三角洲护航 · 专业车队",
    image: "",
    bgColor: "#2d4a35",
    linkType: "products",
    linkValue: "escort",
    sortOrder: 1,
    published: true,
  },
  {
    id: "b2",
    title: "五一活动",
    subtitle: "限时特惠 · 点击查看",
    image: "",
    bgColor: "#3d5240",
    linkType: "tab",
    linkValue: "/pages/products/index",
    sortOrder: 2,
    published: true,
  },
  {
    id: "b3",
    title: "陪玩上车",
    subtitle: "高分选手 · 语音开黑",
    image: "",
    bgColor: "#354840",
    linkType: "products",
    linkValue: "companion",
    sortOrder: 3,
    published: true,
  },
];

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "合规提示",
    content: "未成年人禁止下单",
    placement: "home_bar",
    enabled: true,
    sortOrder: 1,
    startAt: "",
    endAt: "",
  },
];

export function withCmsDefaults(data: Partial<Database>): Pick<Database, "users" | "banners" | "announcements"> {
  return {
    users: data.users?.length ? data.users.map((u) => ({ ...u })) : DEFAULT_USERS.map((u) => ({ ...u })),
    banners: data.banners?.length ? data.banners.map((b) => ({ ...b })) : DEFAULT_BANNERS.map((b) => ({ ...b })),
    announcements: data.announcements?.length
      ? data.announcements.map((a) => ({ ...a }))
      : DEFAULT_ANNOUNCEMENTS.map((a) => ({ ...a })),
  };
}

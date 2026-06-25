import type { Announcement, AppUser, Banner, ContentPage, Order, Product } from "../types.js";
import { appendMediaVersion, resolveMediaUrl } from "./media-url.js";

type VipLevelConfigItem = {
  level: number;
  label: string;
  title: string;
  icon: string;
  bg: string;
  color: string;
};

type VipConfigPayload = {
  vipMin: number;
  vipMax: number;
  levelList: VipLevelConfigItem[];
};

export async function withResolvedBanner(banner: Banner): Promise<Banner> {
  return {
    ...banner,
    image: await resolveMediaUrl(banner.image),
  };
}

export async function withResolvedBanners(banners: Banner[]) {
  return Promise.all(banners.map(withResolvedBanner));
}

export async function withResolvedProduct(product: Product): Promise<Product> {
  const cover = product.cover ? await resolveMediaUrl(product.cover) : "";
  return {
    ...product,
    cover: appendMediaVersion(cover, product.coverRev),
  };
}

export async function withResolvedProducts(products: Product[]) {
  return Promise.all(products.map(withResolvedProduct));
}

export async function withResolvedUser(user: AppUser): Promise<AppUser> {
  return {
    ...user,
    avatar: await resolveMediaUrl(user.avatar),
  };
}

export async function withResolvedUsers(users: AppUser[]) {
  return Promise.all(users.map(withResolvedUser));
}

export async function withResolvedOrder(order: Order): Promise<Order> {
  const cover = order.product.cover;
  return {
    ...order,
    product: {
      ...order.product,
      cover: cover ? await resolveMediaUrl(cover) : cover,
    },
  };
}

export async function withResolvedOrders(orders: Order[]) {
  return Promise.all(orders.map(withResolvedOrder));
}

export async function withResolvedAnnouncement(item: Announcement) {
  return item;
}

export async function withResolvedContentPage(
  page: Pick<ContentPage, "slug" | "title" | "payload">,
): Promise<Pick<ContentPage, "slug" | "title" | "payload">> {
  if (page.slug !== "vip-config" || !page.payload || typeof page.payload !== "object") {
    return page;
  }

  const payload = page.payload as VipConfigPayload;
  if (!Array.isArray(payload.levelList)) {
    return page;
  }

  const levelList = await Promise.all(
    payload.levelList.map(async (item) => ({
      ...item,
      icon: item.icon ? await resolveMediaUrl(item.icon) : item.icon,
    })),
  );

  return {
    ...page,
    payload: {
      ...payload,
      levelList,
    },
  };
}

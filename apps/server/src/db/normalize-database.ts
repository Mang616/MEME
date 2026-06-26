import { PLATFORM_CLUB_ID, buildDefaultPlatformClub } from "../constants/clubs.js";
import { mergeHandlerLegacyProfile } from "../constants/handler-legacy-profiles.js";
import { DEFAULT_PRODUCT_TAGS } from "../constants/product-tags.js";
import { withCmsDefaults } from "./cms-defaults.js";
import type { Database } from "../types.js";

/** 将磁盘/种子中的 partial 数据规范为完整 Database 结构 */
export function normalizeDatabase(data: Partial<Database>): Database {
  const cms = withCmsDefaults(data);
  const clubs =
    data.clubs && data.clubs.length > 0 ? data.clubs.map((club) => ({ ...club })) : [buildDefaultPlatformClub()];
  const users = (data.users ?? []).map((user) => ({
    ...user,
    avatarGender: user.avatarGender ?? "male",
    totalConsume: user.totalConsume ?? 0,
  }));

  return {
    orders: (data.orders ?? []).map((order) => ({ ...order, product: { ...order.product } })),
    products: (data.products ?? []).map((product) => ({
      ...product,
      published: product.published ?? true,
    })),
    clubs,
    handlers: (data.handlers ?? []).map((handler) =>
      mergeHandlerLegacyProfile({
        ...handler,
        clubId: handler.clubId ?? PLATFORM_CLUB_ID,
      }),
    ),
    categories: data.categories ?? { escort: [], companion: [] },
    productTags:
      data.productTags && data.productTags.length > 0
        ? data.productTags.map((tag) => ({ ...tag }))
        : DEFAULT_PRODUCT_TAGS.map((tag) => ({ ...tag })),
    adminUsers: (data.adminUsers ?? []).map((user) => ({ ...user })),
    contentPages: (data.contentPages ?? []).map((page) => ({ ...page })),
    productReviews: (data.productReviews ?? []).map((review) => ({ ...review })),
    chatConversations: (data.chatConversations ?? []).map((conv) => ({
      ...conv,
      staffUnread: conv.staffUnread ?? 0,
      closedAt: conv.closedAt ?? undefined,
    })),
    chatMessages: (data.chatMessages ?? []).map((msg) => ({ ...msg })),
    feedbacks: (data.feedbacks ?? []).map((item) => ({ ...item })),
    userLedger: (data.userLedger ?? []).map((item) => ({ ...item })),
    userCoupons: (data.userCoupons ?? []).map((item) => ({ ...item })),
    ...cms,
    users,
  };
}

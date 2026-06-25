import {
  boolean,
  double,
  int,
  json,
  mysqlTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import type { OrderProductSnapshot } from "../types.js";

export const categories = mysqlTable(
  "categories",
  {
    serviceType: varchar("service_type", { length: 20 }).notNull(),
    id: varchar("id", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.serviceType, table.id] }),
  }),
);

export const productTags = mysqlTable("product_tags", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  style: varchar("style", { length: 20 }).notNull().default("recommend"),
  sortOrder: int("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
});

export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  serviceType: varchar("service_type", { length: 20 }).notNull(),
  categoryId: varchar("category_id", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: double("price").notNull(),
  sold: int("sold").notNull().default(0),
  tag: varchar("tag", { length: 64 }).notNull().default(""),
  cover: varchar("cover", { length: 512 }).notNull().default(""),
  coverColor: varchar("cover_color", { length: 32 }).notNull().default(""),
  coverRev: int("cover_rev").notNull().default(0),
  heroTitle: varchar("hero_title", { length: 255 }).notNull().default(""),
  heroSubtitle: varchar("hero_subtitle", { length: 255 }).notNull().default(""),
  detailDesc: text("detail_desc").notNull().default(""),
  views: int("views").notNull().default(0),
  reviewCount: int("review_count").notNull().default(0),
  positiveRate: int("positive_rate").notNull().default(0),
  intro: text("intro").notNull().default(""),
  limitPerUser: int("limit_per_user").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export const handlers = mysqlTable("handlers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  level: varchar("level", { length: 20 }).notNull(),
  region: varchar("region", { length: 20 }).notNull(),
  serviceType: varchar("service_type", { length: 20 }).notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  avatar: varchar("avatar", { length: 512 }).notNull().default(""),
  online: boolean("online").notNull().default(false),
  clubId: varchar("club_id", { length: 64 }).notNull().default("club_platform"),
});

export const clubs = mysqlTable("clubs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  kind: varchar("kind", { length: 20 }).notNull().default("partner"),
  contactName: varchar("contact_name", { length: 64 }).notNull().default(""),
  contactPhone: varchar("contact_phone", { length: 32 }).notNull().default(""),
  description: varchar("description", { length: 512 }).notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  joinedAt: varchar("joined_at", { length: 32 }).notNull().default(""),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("product_id", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  statusText: varchar("status_text", { length: 64 }).notNull(),
  orderTime: varchar("order_time", { length: 32 }).notNull(),
  region: varchar("region", { length: 32 }).notNull(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  ownerUserId: varchar("owner_user_id", { length: 64 }).notNull().default(""),
  assignedPlayer: varchar("assigned_player", { length: 128 }).notNull().default(""),
  servicePlayer: varchar("service_player", { length: 128 }).notNull().default(""),
  remark: varchar("remark", { length: 512 }),
  productSnapshot: json("product_snapshot").$type<OrderProductSnapshot>().notNull(),
  subtotal: double("subtotal").notNull().default(0),
  couponDiscount: double("coupon_discount").notNull().default(0),
  userCouponId: varchar("user_coupon_id", { length: 64 }).notNull().default(""),
  couponName: varchar("coupon_name", { length: 128 }).notNull().default(""),
  totalPaid: double("total_paid").notNull(),
  paid: boolean("paid").notNull().default(false),
  refunded: boolean("refunded").notNull().default(false),
  autoSettleTime: varchar("auto_settle_time", { length: 32 }).notNull().default(""),
  actions: json("actions").$type<string[]>().notNull(),
});

export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  nickname: varchar("nickname", { length: 128 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull().default(""),
  avatar: varchar("avatar", { length: 512 }).notNull().default(""),
  avatarGender: varchar("avatar_gender", { length: 16 }).notNull().default("male"),
  vipLevel: int("vip_level").notNull().default(0),
  balance: double("balance").notNull().default(0),
  /** 累计消费（充值 + 余额支付订单，用于 VIP 等级） */
  totalConsume: double("total_consume").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  registeredAt: varchar("registered_at", { length: 32 }).notNull().default(""),
  lastLoginAt: varchar("last_login_at", { length: 32 }).notNull().default(""),
  wechatOpenid: varchar("wechat_openid", { length: 128 }).notNull().default(""),
  inviteCode: varchar("invite_code", { length: 16 }).notNull().default(""),
  inviterId: varchar("inviter_id", { length: 64 }).notNull().default(""),
});

export const contentPages = mysqlTable("content_pages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  payload: json("payload").notNull(),
});

export const productReviews = mysqlTable("product_reviews", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("product_id", { length: 64 }).notNull(),
  userName: varchar("user_name", { length: 128 }).notNull(),
  rate: int("rate").notNull().default(5),
  content: text("content").notNull(),
  reviewTime: varchar("review_time", { length: 32 }).notNull().default(""),
  sortOrder: int("sort_order").notNull().default(0),
});

export const chatConversations = mysqlTable("chat_conversations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  type: varchar("type", { length: 32 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  roleLabel: varchar("role_label", { length: 64 }).notNull().default(""),
  escortLevel: varchar("escort_level", { length: 32 }).notNull().default(""),
  avatarText: varchar("avatar_text", { length: 16 }).notNull().default(""),
  avatarColor: varchar("avatar_color", { length: 32 }).notNull().default(""),
  linkedOrderId: varchar("linked_order_id", { length: 64 }).notNull().default(""),
  ownerUserId: varchar("owner_user_id", { length: 64 }).notNull().default(""),
  handlerId: varchar("handler_id", { length: 64 }).notNull().default(""),
  customerGameId: varchar("customer_game_id", { length: 128 }).notNull().default(""),
  lastMessage: varchar("last_message", { length: 512 }).notNull().default(""),
  lastTime: varchar("last_time", { length: 32 }).notNull().default(""),
  unread: int("unread").notNull().default(0),
  staffUnread: int("staff_unread").notNull().default(0),
  online: boolean("online").notNull().default(false),
  sortOrder: int("sort_order").notNull().default(0),
});

export const chatMessages = mysqlTable("chat_messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 64 }).notNull(),
  from: varchar("from_role", { length: 16 }).notNull(),
  type: varchar("type", { length: 32 }).notNull().default("text"),
  content: text("content").notNull(),
  time: varchar("time", { length: 32 }).notNull().default(""),
  senderType: varchar("sender_type", { length: 16 }).notNull().default("user"),
  senderId: varchar("sender_id", { length: 64 }).notNull().default(""),
});

export const adminUsers = mysqlTable("admin_users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  username: varchar("username", { length: 64 }).notNull(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  displayName: varchar("display_name", { length: 128 }).notNull().default(""),
  roles: json("roles").$type<string[]>().notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: varchar("created_at", { length: 32 }).notNull().default(""),
});

export const feedbacks = mysqlTable("feedbacks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull().default(""),
  typeId: varchar("type_id", { length: 32 }).notNull(),
  content: text("content").notNull(),
  contact: varchar("contact", { length: 64 }).notNull().default(""),
  createdAt: varchar("created_at", { length: 32 }).notNull().default(""),
});

export const userLedger = mysqlTable("user_ledger", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  type: varchar("type", { length: 32 }).notNull(),
  consumeAmount: double("consume_amount").notNull().default(0),
  balanceDelta: double("balance_delta").notNull(),
  balanceAfter: double("balance_after").notNull(),
  totalConsumeAfter: double("total_consume_after").notNull(),
  remark: varchar("remark", { length: 512 }).notNull().default(""),
  refId: varchar("ref_id", { length: 64 }).notNull().default(""),
  createdAt: varchar("created_at", { length: 32 }).notNull(),
});

export const userCoupons = mysqlTable("user_coupons", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  templateId: varchar("template_id", { length: 64 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: varchar("description", { length: 512 }).notNull().default(""),
  type: varchar("type", { length: 16 }).notNull(),
  value: double("value").notNull().default(0),
  minSpend: double("min_spend").notNull().default(0),
  maxDiscount: double("max_discount").notNull().default(0),
  scope: varchar("scope", { length: 16 }).notNull().default("all"),
  expiresAt: varchar("expires_at", { length: 32 }).notNull(),
  usedAt: varchar("used_at", { length: 32 }).notNull().default(""),
  usedOrderId: varchar("used_order_id", { length: 64 }).notNull().default(""),
  claimedAt: varchar("claimed_at", { length: 32 }).notNull(),
});

export const banners = mysqlTable("banners", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }).notNull().default(""),
  image: varchar("image", { length: 512 }).notNull().default(""),
  bgColor: varchar("bg_color", { length: 32 }).notNull().default("#2d4a35"),
  linkType: varchar("link_type", { length: 20 }).notNull().default("none"),
  linkValue: varchar("link_value", { length: 255 }).notNull().default(""),
  sortOrder: int("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export const announcements = mysqlTable("announcements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  placement: varchar("placement", { length: 32 }).notNull().default("home_bar"),
  enabled: boolean("enabled").notNull().default(true),
  sortOrder: int("sort_order").notNull().default(0),
  startAt: varchar("start_at", { length: 32 }).notNull().default(""),
  endAt: varchar("end_at", { length: 32 }).notNull().default(""),
});

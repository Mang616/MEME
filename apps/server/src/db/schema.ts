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
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productId: varchar("product_id", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  statusText: varchar("status_text", { length: 64 }).notNull(),
  orderTime: varchar("order_time", { length: 32 }).notNull(),
  region: varchar("region", { length: 32 }).notNull(),
  userId: varchar("user_id", { length: 128 }).notNull(),
  assignedPlayer: varchar("assigned_player", { length: 128 }).notNull().default(""),
  servicePlayer: varchar("service_player", { length: 128 }).notNull().default(""),
  remark: varchar("remark", { length: 512 }),
  productSnapshot: json("product_snapshot").$type<OrderProductSnapshot>().notNull(),
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
  vipLevel: int("vip_level").notNull().default(0),
  balance: double("balance").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  registeredAt: varchar("registered_at", { length: 32 }).notNull().default(""),
  lastLoginAt: varchar("last_login_at", { length: 32 }).notNull().default(""),
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

import type { OrderStatus, ServiceType } from "@meme/types";

export type { OrderStatus, ServiceType };

export type EscortLevel = "demon" | "ace" | "rookie";
export type HandlerRegion = "pc" | "mobile";
export type HandlerGender = "male" | "female";

export type OrderProductSnapshot = {
  title: string;
  desc: string;
  price: number;
  quantity: number;
  cover?: string;
  coverColor?: string;
};

export type Order = {
  id: string;
  productId: string;
  status: OrderStatus;
  statusText: string;
  orderTime: string;
  region: string;
  userId: string;
  assignedPlayer: string;
  servicePlayer: string;
  remark?: string;
  product: OrderProductSnapshot;
  totalPaid: number;
  paid: boolean;
  refunded: boolean;
  autoSettleTime: string;
  actions: string[];
};

export type Product = {
  id: string;
  serviceType: ServiceType;
  categoryId: string;
  title: string;
  desc: string;
  price: number;
  sold: number;
  tag: string;
  cover: string;
  coverColor: string;
  heroTitle: string;
  heroSubtitle: string;
  detailDesc: string;
  views: number;
  reviewCount: number;
  positiveRate: number;
  intro: string;
  limitPerUser: number;
  published?: boolean;
};

export type Handler = {
  id: string;
  name: string;
  level: EscortLevel;
  region: HandlerRegion;
  serviceType: ServiceType;
  gender: HandlerGender;
  avatar: string;
  online: boolean;
};

export type SubCategory = { id: string; name: string };

export type Database = {
  orders: Order[];
  products: Product[];
  handlers: Handler[];
  categories: Record<ServiceType, SubCategory[]>;
};

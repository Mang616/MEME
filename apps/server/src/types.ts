import type { AdminRole } from "./constants/admin-rbac.js";
import type { OrderStatus, ServiceType } from "@meme/types";

export type { OrderStatus, ServiceType };

export type EscortLevel = "demon" | "ace" | "rookie";
export type HandlerRegion = "pc" | "mobile";
export type HandlerGender = "male" | "female";

export type ClubKind = "platform" | "partner";

export type Club = {
  id: string;
  name: string;
  kind: ClubKind;
  contactName: string;
  contactPhone: string;
  description: string;
  enabled: boolean;
  joinedAt: string;
};

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
  /** 小程序登录用户 ID，用于聊天归属 */
  ownerUserId?: string;
  assignedPlayer: string;
  servicePlayer: string;
  remark?: string;
  product: OrderProductSnapshot;
  /** 优惠前小计 */
  subtotal?: number;
  /** 优惠券减免 */
  couponDiscount?: number;
  userCouponId?: string;
  couponName?: string;
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
  /** 封面更新版本，用于客户端绕过同 URL 图片缓存 */
  coverRev?: number;
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
  clubId: string;
};

export type SubCategory = { id: string; name: string };

export type ProductTagStyle = "recommend" | "new";

export type ProductTag = {
  id: string;
  name: string;
  style: ProductTagStyle;
  sortOrder: number;
  enabled: boolean;
};

export type ContentPage = {
  id: string;
  slug: string;
  title: string;
  payload: unknown;
};

export type ProductReview = {
  id: string;
  productId: string;
  userName: string;
  rate: number;
  content: string;
  reviewTime: string;
  sortOrder?: number;
};

export type ChatConversation = {
  id: string;
  type: string;
  name: string;
  roleLabel: string;
  escortLevel?: string;
  avatarText: string;
  avatarColor: string;
  linkedOrderId?: string;
  ownerUserId?: string;
  handlerId?: string;
  customerGameId?: string;
  lastMessage: string;
  lastTime: string;
  /** 用户侧未读（客服/打手发给用户） */
  unread: number;
  /** 后台侧未读（用户发来待处理） */
  staffUnread?: number;
  online: boolean;
  sortOrder?: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  from: "self" | "other";
  type: string;
  content: string;
  time: string;
  senderType?: "user" | "staff" | "system";
  senderId?: string;
};

export type Feedback = {
  id: string;
  userId: string;
  typeId: string;
  content: string;
  contact: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  roles: AdminRole[];
  enabled: boolean;
  createdAt: string;
};

export type UserLedgerType =
  | "recharge"
  | "order_pay"
  | "admin_increment"
  | "admin_decrement"
  | "admin_set";

export type UserLedgerEntry = {
  id: string;
  userId: string;
  type: UserLedgerType;
  /** 计入累计消费的金额（元） */
  consumeAmount: number;
  /** 余额变动（元，正为增加） */
  balanceDelta: number;
  balanceAfter: number;
  totalConsumeAfter: number;
  remark: string;
  refId: string;
  createdAt: string;
};

export type Database = {
  orders: Order[];
  products: Product[];
  clubs: Club[];
  handlers: Handler[];
  categories: Record<ServiceType, SubCategory[]>;
  productTags: ProductTag[];
  users: AppUser[];
  banners: Banner[];
  announcements: Announcement[];
  contentPages: ContentPage[];
  productReviews: ProductReview[];
  chatConversations: ChatConversation[];
  chatMessages: ChatMessage[];
  feedbacks: Feedback[];
  userLedger: UserLedgerEntry[];
  userCoupons: UserCoupon[];
  adminUsers: AdminUser[];
};

export type UserStatus = "active" | "disabled";

import type { AvatarGender } from "@meme/user-profile";

export type { AvatarGender };

export type AppUser = {
  id: string;
  nickname: string;
  phone: string;
  avatar: string;
  avatarGender?: AvatarGender;
  vipLevel: number;
  balance: number;
  /** 累计消费（元），充值与余额支付订单计入，用于 VIP 等级 */
  totalConsume: number;
  status: UserStatus;
  registeredAt: string;
  lastLoginAt: string;
  wechatOpenid?: string;
  /** 专属邀请码（8 位） */
  inviteCode: string;
  /** 上级用户 ID */
  inviterId: string;
};

export type CouponType = "fixed" | "percent";
export type CouponScope = "all" | "escort" | "companion";

export type UserCoupon = {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  description: string;
  type: CouponType;
  value: number;
  minSpend: number;
  maxDiscount: number;
  scope: CouponScope;
  expiresAt: string;
  usedAt: string;
  usedOrderId: string;
  claimedAt: string;
};

export type BannerLinkType = "products" | "tab" | "none";

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  linkType: BannerLinkType;
  linkValue: string;
  sortOrder: number;
  published: boolean;
};

export type AnnouncementPlacement = "home_bar" | "popup";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  placement: AnnouncementPlacement;
  enabled: boolean;
  sortOrder: number;
  startAt: string;
  endAt: string;
};

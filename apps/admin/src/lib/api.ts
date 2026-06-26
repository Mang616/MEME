const AUTH_KEY = "meme_admin_token";

import { clearAdminSession, setAdminSession, toAdminSession, type AdminSession } from "./session";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function getToken(): string | null {
  return sessionStorage.getItem(AUTH_KEY);
}

export function setToken(token: string) {
  sessionStorage.setItem(AUTH_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(AUTH_KEY);
  clearAdminSession();
}

/** 清除旧版 mock 登录留下的无效 token */
export function normalizeStoredToken() {
  const token = getToken();
  if (!token) return;
  if (token === "dev-token" || !token.startsWith("meme.")) {
    clearToken();
  }
}

export function isAuthenticated(): boolean {
  normalizeStoredToken();
  return Boolean(getToken());
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
};

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};

  if (!options.formData) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.formData
        ? options.formData
        : options.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "无法连接 API，请先运行 npm run server:dev",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    if (response.status === 401 && path !== "/admin/auth/login") {
      clearToken();
      redirectToLogin();
    }

    const message =
      payload.message ??
      (response.status >= 500
        ? "API 服务异常，请确认已运行 npm run server:dev"
        : "请求失败");

    throw new ApiError(
      response.status,
      payload.error ?? "REQUEST_FAILED",
      message,
    );
  }

  return payload as T;
}

export type LoginResponse = {
  token: string;
  username: string;
  displayName: string;
  adminId: string;
  roles: AdminSession["roles"];
  permissions: AdminSession["permissions"];
  handlerId?: string;
};

export type ListResponse<T> = { items: T[]; total: number };

export type OrderStatus =
  | "pending_accept"
  | "pending_confirm"
  | "completed"
  | "after_sale";

export type OrderRow = {
  id: string;
  status: OrderStatus;
  serviceType?: "escort" | "companion";
  productTitle: string;
  productCover: string;
  productCoverColor: string;
  totalPaid: number;
  region: string;
  gameId: string;
  assignedPlayer: string;
  servicePlayer: string;
  remark: string;
  orderTime: string;
};

/** 接单大厅专用：仅商品信息，不含用户/订单敏感字段 */
export type HallOrderRow = {
  id: string;
  serviceType?: "escort" | "companion";
  productTitle: string;
  productCover: string;
  productCoverColor: string;
  totalPaid: number;
  quantity: number;
  /** 游戏端口原始值，展示请用 formatGamePortLabel */
  gamePort: string;
};

export type ProductRow = {
  id: string;
  title: string;
  serviceType: "escort" | "companion";
  categoryId: string;
  categoryName: string;
  price: number;
  sold: number;
  tag: string;
  cover: string;
  coverColor: string;
  limitPerUser: number;
  couponAllowed: boolean;
  published: boolean;
};

export type CategoryRow = {
  serviceType: "escort" | "companion";
  id: string;
  name: string;
  productCount: number;
};

export type ProductTagRow = {
  id: string;
  name: string;
  style: "recommend" | "new";
  sortOrder: number;
  enabled: boolean;
  productCount: number;
};

export type HandlerRow = {
  id: string;
  name: string;
  level: "demon" | "ace" | "rookie";
  region: "pc" | "mobile";
  serviceType: "escort" | "companion";
  gender: "male" | "female";
  online: boolean;
  clubId: string;
  clubName: string;
  clubKind: "platform" | "partner";
  isOwnClub: boolean;
  clubEnabled: boolean;
  realName: string;
  idNumber: string;
  phone: string;
  wechat: string;
  alipay: string;
  adminUserId: string;
  adminUsername: string;
  adminDisplayName: string;
};

export type CreateHandlerWithAccountBody = {
  name: string;
  level: HandlerRow["level"];
  region: HandlerRow["region"];
  serviceType: HandlerRow["serviceType"];
  gender: HandlerRow["gender"];
  clubId: string;
  online?: boolean;
  realName: string;
  idNumber: string;
  phone: string;
  wechat: string;
  alipay: string;
  username: string;
  password: string;
  displayName?: string;
};

export type ClubRow = {
  id: string;
  name: string;
  kind: "platform" | "partner";
  kindLabel: string;
  isPlatform: boolean;
  contactName: string;
  contactPhone: string;
  description: string;
  enabled: boolean;
  joinedAt: string;
  handlerCount: number;
};

export type UserRow = {
  id: string;
  nickname: string;
  phone: string;
  avatar: string;
  vipLevel: number;
  balance: number;
  totalConsume: number;
  status: "active" | "disabled";
  registeredAt: string;
  lastLoginAt: string;
  inviteCode: string;
  inviterId: string;
  inviterNickname?: string;
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
  consumeAmount: number;
  balanceDelta: number;
  balanceAfter: number;
  totalConsumeAfter: number;
  remark: string;
  refId: string;
  createdAt: string;
};

export type UserDetailPayload = {
  user: UserRow;
  ledger: UserLedgerEntry[];
  orders: OrderRow[];
  inviter: {
    id: string;
    nickname: string;
    inviteCode: string;
  } | null;
};

export type BannerRow = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
  linkType: "products" | "tab" | "none";
  linkValue: string;
  sortOrder: number;
  published: boolean;
};

export type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  placement: "home_bar" | "popup";
  enabled: boolean;
  sortOrder: number;
  startAt: string;
  endAt: string;
};

export type ContentPageRow = {
  id: string;
  slug: string;
  title: string;
  payload: unknown;
};

export type VipLevelConfigItem = {
  level: number;
  label: string;
  title: string;
  icon: string;
  bg: string;
  color: string;
};

export type VipConfigPayload = {
  vipMin: number;
  vipMax: number;
  levelList: VipLevelConfigItem[];
};

export type VipPrivilegeRow = {
  id: string;
  name: string;
  value: string;
  unlocked: boolean;
};

export type VipLevelActivityItem = {
  level: number;
  /** 达到该等级所需的累计消费（元） */
  cumulativeThreshold: number;
  /** 本级升至下一级所需增量（由累计门槛自动推算，只读展示） */
  upgradeTarget: number;
  privilegeRows: VipPrivilegeRow[];
};

export type VipActivityPayload = {
  consumeLabel: string;
  promotionRewardText: string;
  maxLevelHint: string;
  upgradeHintTemplate: string;
  sectionTitle: string;
  sectionSubtitleTemplate: string;
  levelList: VipLevelActivityItem[];
};

export type CouponType = "fixed" | "percent";
export type CouponScope = "all" | "escort" | "companion";

export type CouponItem = {
  id: string;
  name: string;
  description: string;
  type: CouponType;
  value: number;
  minSpend: number;
  maxDiscount: number;
  validDays: number;
  scope: CouponScope;
  enabled: boolean;
  sortOrder: number;
};

export type CouponsPayload = {
  items: CouponItem[];
};

export type { InviteActivityPayload } from "@/lib/invite-activity";
export type { RegisterActivityPayload } from "@/lib/register-activity";

export type CategoriesMap = Record<
  "escort" | "companion",
  { id: string; name: string }[]
>;

export type StaffUserRow = {
  id: string;
  username: string;
  displayName: string;
  roles: AdminSession["roles"];
  roleLabels: string[];
  enabled: boolean;
  createdAt: string;
  handlerId?: string;
};

export type AdminRoleRow = {
  id: AdminSession["roles"][number];
  label: string;
  description: string;
  locked: boolean;
  permissionCount: number;
};

export type RolePermissionMatrix = {
  roles: { id: AdminSession["roles"][number]; label: string; locked: boolean }[];
  permissions: { id: string; label: string }[];
  groups: { label: string; permissions: AdminSession["permissions"] }[];
  matrix: Record<AdminSession["roles"][number], AdminSession["permissions"]>;
  defaults: Record<AdminSession["roles"][number], AdminSession["permissions"]>;
};

export type UploadStatus = {
  enabled: boolean;
  private: boolean;
  signExpiresSec: number;
  origin: string;
  bucket: string;
  region: string;
  folders: string[];
};

export type UploadResult = {
  key: string;
  storage: string;
  url: string;
};

export type AnalyticsOverview = {
  orders: {
    total: number;
    revenue: number;
    byStatus: Record<OrderStatus, number>;
  };
  products: { total: number; published: number; sold: number };
  users: { total: number; active: number };
  handlers: { total: number; online: number };
  service: { conversations: number; unread: number; feedbacks: number };
};

export type AnalyticsReport = {
  range: { from: string; to: string };
  summary: {
    userTotal: number;
    newUsers: number;
    orderCount: number;
    revenue: number;
  };
  daily: {
    labels: string[];
    newUsers: number[];
    orders: number[];
    revenue: number[];
  };
  products: {
    byQuantity: { name: string; value: number }[];
    byAmount: { name: string; value: number }[];
  };
};

export type ChatRow = {
  id: string;
  type: string;
  typeLabel: string;
  /** 后台视角：会话对象（用户） */
  name: string;
  ownerUserId?: string;
  ownerNickname?: string;
  ownerPhone?: string;
  /** 打手会话关联的服务打手 */
  handlerName?: string;
  lastMessage: string;
  lastTime: string;
  /** 员工侧未读（staffUnread） */
  unread: number;
  online: boolean;
  linkedOrderId: string;
  closedAt?: string;
};

export type ChatMessageRow = {
  id: string;
  from: "self" | "other";
  fromLabel: string;
  content: string;
  time: string;
};

export type FeedbackRow = {
  id: string;
  userId: string;
  userNickname: string;
  typeId: string;
  typeLabel: string;
  content: string;
  contact: string;
  createdAt: string;
};

export type SignMediaResult = {
  url: string;
  storage: string;
};

export const api = {
  login(username: string, password: string) {
    return request<LoginResponse>("/admin/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    }).then((result) => {
      setToken(result.token);
      setAdminSession(toAdminSession(result));
      return result;
    });
  },

  fetchMe() {
    return request<LoginResponse & { ok: boolean }>("/admin/auth/me");
  },

  updateProfile(body: {
    displayName?: string;
    currentPassword?: string;
    password?: string;
  }) {
    return request<LoginResponse & { ok: boolean }>("/admin/auth/me", {
      method: "PATCH",
      body,
    }).then((result) => {
      if (result.token) {
        setToken(result.token);
      }
      setAdminSession(toAdminSession(result));
      return result;
    });
  },

  touchAdminPresence() {
    return request<{ ok: boolean; linked?: boolean; online?: boolean }>("/admin/auth/presence", {
      method: "POST",
    });
  },

  logoutAdmin() {
    return request<{ ok: boolean }>("/admin/auth/logout", { method: "POST" });
  },

  listOrders() {
    return request<ListResponse<OrderRow>>("/admin/orders");
  },

  listMyOrders() {
    return request<ListResponse<OrderRow>>("/admin/orders/mine");
  },

  watchMyOrders() {
    return request<ListResponse<OrderRow>>("/admin/orders/mine/watch");
  },

  listAfterSaleOrders() {
    return request<ListResponse<OrderRow>>("/admin/orders/after-sales");
  },

  listOrderHall() {
    return request<ListResponse<HallOrderRow>>("/admin/orders/hall");
  },

  listOrderDispatch() {
    return request<ListResponse<OrderRow>>("/admin/orders/dispatch");
  },

  watchPendingOrders() {
    return request<ListResponse<OrderRow>>("/admin/orders/watch");
  },

  acceptOrder(id: string) {
    return request<HallOrderRow>(`/admin/orders/${id}/accept`, { method: "POST" });
  },

  assignOrder(id: string, body: { handlerId?: string; servicePlayer?: string }) {
    return request<OrderRow>(`/admin/orders/${id}/assign`, {
      method: "POST",
      body,
    });
  },

  updateOrder(
    id: string,
    body: { status?: OrderStatus; servicePlayer?: string },
  ) {
    return request<OrderRow>(`/admin/orders/${id}`, {
      method: "PATCH",
      body,
    });
  },

  listProducts() {
    return request<ListResponse<ProductRow>>("/admin/products");
  },

  listCategories() {
    return request<CategoriesMap>("/admin/products/categories");
  },

  listCategoryRows() {
    return request<ListResponse<CategoryRow>>("/admin/categories");
  },

  createCategory(body: Pick<CategoryRow, "serviceType" | "id" | "name">) {
    return request<CategoryRow>("/admin/categories", {
      method: "POST",
      body,
    });
  },

  updateCategory(
    serviceType: CategoryRow["serviceType"],
    id: string,
    body: Pick<CategoryRow, "name">,
  ) {
    return request<CategoryRow>(`/admin/categories/${serviceType}/${id}`, {
      method: "PUT",
      body,
    });
  },

  deleteCategory(serviceType: CategoryRow["serviceType"], id: string) {
    return request<void>(`/admin/categories/${serviceType}/${id}`, { method: "DELETE" });
  },

  listProductTagRows() {
    return request<ListResponse<ProductTagRow>>("/admin/product-tags");
  },

  createProductTag(
    body: Pick<ProductTagRow, "id" | "name" | "style" | "sortOrder" | "enabled">,
  ) {
    return request<ProductTagRow>("/admin/product-tags", {
      method: "POST",
      body,
    });
  },

  updateProductTag(
    id: string,
    body: Partial<Pick<ProductTagRow, "name" | "style" | "sortOrder" | "enabled">>,
  ) {
    return request<ProductTagRow>(`/admin/product-tags/${id}`, {
      method: "PUT",
      body,
    });
  },

  deleteProductTag(id: string) {
    return request<void>(`/admin/product-tags/${id}`, { method: "DELETE" });
  },

  createProduct(
    body: Omit<ProductRow, "id" | "categoryName" | "sold"> & { sold?: number },
  ) {
    return request<ProductRow>("/admin/products", {
      method: "POST",
      body,
    });
  },

  updateProduct(id: string, body: Partial<Omit<ProductRow, "id" | "categoryName">>) {
    return request<ProductRow>(`/admin/products/${id}`, {
      method: "PUT",
      body,
    });
  },

  deleteProduct(id: string) {
    return request<void>(`/admin/products/${id}`, { method: "DELETE" });
  },

  listHandlers() {
    return request<ListResponse<HandlerRow>>("/admin/handlers");
  },

  listDispatchableHandlers() {
    return request<ListResponse<HandlerRow>>("/admin/handlers/dispatchable");
  },

  listClubs() {
    return request<ListResponse<ClubRow>>("/admin/clubs");
  },

  createClub(body: {
    name: string;
    kind: ClubRow["kind"];
    contactName: string;
    contactPhone: string;
    description: string;
    enabled: boolean;
  }) {
    return request<ClubRow>("/admin/clubs", {
      method: "POST",
      body: {
        name: body.name,
        kind: body.kind,
        contactName: body.contactName,
        contactPhone: body.contactPhone,
        description: body.description,
        enabled: body.enabled,
      },
    });
  },

  updateClub(
    id: string,
    body: Partial<Omit<ClubRow, "id" | "kind" | "kindLabel" | "isPlatform" | "handlerCount">>,
  ) {
    return request<ClubRow>(`/admin/clubs/${id}`, {
      method: "PUT",
      body,
    });
  },

  setClubEnabled(id: string, enabled: boolean) {
    return request<ClubRow>(`/admin/clubs/${id}/enabled`, {
      method: "PATCH",
      body: { enabled },
    });
  },

  deleteClub(id: string) {
    return request<void>(`/admin/clubs/${id}`, { method: "DELETE" });
  },

  createHandler(
    body: Omit<
      HandlerRow,
      | "id"
      | "clubName"
      | "clubKind"
      | "isOwnClub"
      | "clubEnabled"
      | "adminUserId"
      | "adminUsername"
      | "adminDisplayName"
    >,
  ) {
    return request<HandlerRow>("/admin/handlers", {
      method: "POST",
      body,
    });
  },

  createHandlerWithAccount(body: CreateHandlerWithAccountBody) {
    return request<HandlerRow>("/admin/handlers/with-account", {
      method: "POST",
      body,
    });
  },

  updateHandler(
    id: string,
    body: Partial<
      Omit<
        HandlerRow,
        | "id"
        | "clubName"
        | "clubKind"
        | "isOwnClub"
        | "clubEnabled"
        | "adminUserId"
        | "adminUsername"
        | "adminDisplayName"
      >
    >,
  ) {
    return request<HandlerRow>(`/admin/handlers/${id}`, {
      method: "PUT",
      body,
    });
  },

  setHandlerOnline(id: string, online: boolean) {
    return request<HandlerRow>(`/admin/handlers/${id}/online`, {
      method: "PATCH",
      body: { online },
    });
  },

  deleteHandler(id: string) {
    return request<void>(`/admin/handlers/${id}`, { method: "DELETE" });
  },

  listUsers() {
    return request<ListResponse<UserRow>>("/admin/users");
  },

  getUserDetail(id: string) {
    return request<UserDetailPayload>(`/admin/users/${id}/detail`);
  },

  updateUser(id: string, body: Partial<Omit<UserRow, "id" | "registeredAt" | "lastLoginAt" | "balance" | "vipLevel" | "totalConsume" | "inviteCode" | "inviterNickname">>) {
    return request<UserRow>(`/admin/users/${id}`, {
      method: "PUT",
      body,
    });
  },

  adjustUserBalance(
    id: string,
    body: {
      mode: "increment" | "decrement" | "set";
      amount: number;
      adminPassword: string;
      remark?: string;
    },
  ) {
    return request<UserRow & { previousBalance: number }>(`/admin/users/${id}/balance`, {
      method: "POST",
      body,
    });
  },

  listBanners() {
    return request<ListResponse<BannerRow>>("/admin/banners");
  },

  createBanner(body: Omit<BannerRow, "id">) {
    return request<BannerRow>("/admin/banners", {
      method: "POST",
      body,
    });
  },

  updateBanner(id: string, body: Partial<Omit<BannerRow, "id">>) {
    return request<BannerRow>(`/admin/banners/${id}`, {
      method: "PUT",
      body,
    });
  },

  deleteBanner(id: string) {
    return request<void>(`/admin/banners/${id}`, { method: "DELETE" });
  },

  listAnnouncements() {
    return request<ListResponse<AnnouncementRow>>("/admin/announcements");
  },

  createAnnouncement(body: Omit<AnnouncementRow, "id">) {
    return request<AnnouncementRow>("/admin/announcements", {
      method: "POST",
      body,
    });
  },

  updateAnnouncement(id: string, body: Partial<Omit<AnnouncementRow, "id">>) {
    return request<AnnouncementRow>(`/admin/announcements/${id}`, {
      method: "PUT",
      body,
    });
  },

  deleteAnnouncement(id: string) {
    return request<void>(`/admin/announcements/${id}`, { method: "DELETE" });
  },

  listContentPages() {
    return request<ListResponse<ContentPageRow>>("/admin/content-pages");
  },

  getContentPage(slug: string) {
    return request<ContentPageRow>(`/admin/content-pages/${encodeURIComponent(slug)}`);
  },

  updateContentPage(slug: string, body: Partial<Pick<ContentPageRow, "title" | "payload">>) {
    return request<ContentPageRow>(`/admin/content-pages/${encodeURIComponent(slug)}`, {
      method: "PUT",
      body,
    });
  },

  getVipConfig() {
    return request<ContentPageRow & { payload: VipConfigPayload }>("/admin/content-pages/vip-config");
  },

  updateVipConfig(payload: VipConfigPayload) {
    return request<ContentPageRow & { payload: VipConfigPayload }>("/admin/content-pages/vip-config", {
      method: "PUT",
      body: { payload },
    });
  },

  getVipActivity() {
    return request<ContentPageRow & { payload: VipActivityPayload }>(
      "/admin/content-pages/vip-activity",
    );
  },

  updateVipActivity(payload: VipActivityPayload) {
    return request<ContentPageRow & { payload: VipActivityPayload }>(
      "/admin/content-pages/vip-activity",
      {
        method: "PUT",
        body: { payload },
      },
    );
  },

  getCoupons() {
    return request<ContentPageRow & { payload: CouponsPayload }>("/admin/content-pages/coupons");
  },

  updateCoupons(payload: CouponsPayload) {
    return request<ContentPageRow & { payload: CouponsPayload }>("/admin/content-pages/coupons", {
      method: "PUT",
      body: { payload },
    });
  },

  getRegisterActivity() {
    return request<ContentPageRow & { payload: RegisterActivityPayload }>(
      "/admin/content-pages/register-activity",
    );
  },

  updateRegisterActivity(payload: RegisterActivityPayload) {
    return request<ContentPageRow & { payload: RegisterActivityPayload }>(
      "/admin/content-pages/register-activity",
      {
        method: "PUT",
        body: { payload },
      },
    );
  },

  getInviteActivity() {
    return request<ContentPageRow & { payload: InviteActivityPayload }>(
      "/admin/content-pages/invite-activity",
    );
  },

  updateInviteActivity(payload: InviteActivityPayload) {
    return request<ContentPageRow & { payload: InviteActivityPayload }>(
      "/admin/content-pages/invite-activity",
      {
        method: "PUT",
        body: { payload },
      },
    );
  },

  getUploadStatus() {
    return request<UploadStatus>("/admin/upload/status");
  },

  signMediaUrl(storage: string) {
    const query = new URLSearchParams({ storage });
    return request<SignMediaResult>(`/admin/upload/sign?${query.toString()}`);
  },

  uploadImage(
    file: File,
    folder: UploadStatus["folders"][number] = "common",
    entityId?: string,
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    if (entityId) formData.append("entityId", entityId);
    return request<UploadResult>("/admin/upload", {
      method: "POST",
      formData,
    });
  },

  getAnalyticsOverview() {
    return request<AnalyticsOverview>("/admin/analytics/overview");
  },

  getAnalyticsReport(from: string, to: string) {
    const query = new URLSearchParams({ from, to });
    return request<AnalyticsReport>(`/admin/analytics/report?${query.toString()}`);
  },

  listChats() {
    return request<ListResponse<ChatRow>>("/admin/chats");
  },

  getChatMessages(id: string) {
    return request<{
      conversation: ChatRow;
      messages: ChatMessageRow[];
    }>(`/admin/chats/${id}/messages`);
  },

  replyChat(id: string, content: string) {
    return request<ChatMessageRow>(`/admin/chats/${id}/messages`, {
      method: "POST",
      body: { content },
    });
  },

  closeChat(id: string) {
    return request<ChatRow>(`/admin/chats/${id}/close`, { method: "POST" });
  },

  listFeedbacks() {
    return request<ListResponse<FeedbackRow>>("/admin/feedbacks");
  },

  listStaffUsers() {
    return request<ListResponse<StaffUserRow>>("/admin/staff");
  },

  listStaffRoles() {
    return request<{ items: { id: string; label: string }[] }>("/admin/staff/roles");
  },

  createStaffUser(
    body: Pick<StaffUserRow, "username" | "displayName" | "roles" | "enabled"> & {
      password: string;
      handlerId?: string;
    },
  ) {
    return request<StaffUserRow>("/admin/staff", { method: "POST", body });
  },

  updateStaffUser(
    id: string,
    body: Partial<Pick<StaffUserRow, "displayName" | "roles" | "enabled" | "handlerId">> & {
      password?: string;
    },
  ) {
    return request<StaffUserRow>(`/admin/staff/${id}`, { method: "PUT", body });
  },

  deleteStaffUser(id: string) {
    return request<void>(`/admin/staff/${id}`, { method: "DELETE" });
  },

  getRolePermissions() {
    return request<RolePermissionMatrix>("/admin/permissions");
  },

  listAdminRoles() {
    return request<ListResponse<AdminRoleRow>>("/admin/roles");
  },

  updateRolePermissions(role: AdminSession["roles"][number], permissions: string[]) {
    return request<RolePermissionMatrix>(`/admin/permissions/${role}`, {
      method: "PUT",
      body: { permissions },
    });
  },

  resetRolePermissions(role: AdminSession["roles"][number]) {
    return request<RolePermissionMatrix>(`/admin/permissions/${role}/reset`, {
      method: "POST",
    });
  },
};

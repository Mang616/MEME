const AUTH_KEY = "meme_admin_token";

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
};

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = `/login?from=${encodeURIComponent(window.location.pathname)}`;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
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

export type LoginResponse = { token: string; username: string };

export type ListResponse<T> = { items: T[]; total: number };

export type OrderStatus =
  | "pending_accept"
  | "pending_confirm"
  | "completed"
  | "after_sale";

export type OrderRow = {
  id: string;
  status: OrderStatus;
  productTitle: string;
  totalPaid: number;
  region: string;
  gameId: string;
  servicePlayer: string;
  orderTime: string;
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
  limitPerUser: number;
  published: boolean;
};

export type HandlerRow = {
  id: string;
  name: string;
  level: "demon" | "ace" | "rookie";
  region: "pc" | "mobile";
  serviceType: "escort" | "companion";
  gender: "male" | "female";
  online: boolean;
};

export type UserRow = {
  id: string;
  nickname: string;
  phone: string;
  avatar: string;
  vipLevel: number;
  balance: number;
  status: "active" | "disabled";
  registeredAt: string;
  lastLoginAt: string;
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

export type CategoriesMap = Record<
  "escort" | "companion",
  { id: string; name: string }[]
>;

export const api = {
  login(username: string, password: string) {
    return request<LoginResponse>("/admin/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
  },

  listOrders() {
    return request<ListResponse<OrderRow>>("/admin/orders");
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

  createProduct(body: Omit<ProductRow, "id" | "categoryName" | "sold"> & { sold?: number }) {
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

  createHandler(body: Omit<HandlerRow, "id">) {
    return request<HandlerRow>("/admin/handlers", {
      method: "POST",
      body,
    });
  },

  updateHandler(id: string, body: Partial<Omit<HandlerRow, "id">>) {
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

  updateUser(id: string, body: Partial<Omit<UserRow, "id" | "registeredAt" | "lastLoginAt">>) {
    return request<UserRow>(`/admin/users/${id}`, {
      method: "PUT",
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
};

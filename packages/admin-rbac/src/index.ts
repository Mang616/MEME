/** 后台 RBAC 共享定义：角色、权限点、默认矩阵与展示文案（server / admin 单一数据源） */

export const ADMIN_ROLES = ["super_admin", "operator", "cs", "handler", "companion"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const EDITABLE_ROLES = ADMIN_ROLES.filter(
  (role): role is Exclude<AdminRole, "super_admin"> => role !== "super_admin",
);

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "超级管理员",
  operator: "运营",
  cs: "客服",
  handler: "打手",
  companion: "陪玩",
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: "拥有全部后台权限，负责系统配置与账号管理",
  operator: "负责商品、订单、内容、打手档案等日常运营",
  cs: "负责平台客服会话、意见反馈与售后跟进",
  handler: "护航接单：查看指派/已接订单、抢护航大厅订单、与用户沟通",
  companion: "陪玩接单：查看指派/已接订单、抢陪玩大厅订单、与用户沟通（不可接护航单）",
};

export const ADMIN_PERMISSIONS = [
  "operations.read",
  "analytics.read",
  "orders.read",
  "orders.mine",
  "orders.write",
  "orders.accept",
  "orders.dispatch",
  "products.read",
  "products.write",
  "categories.read",
  "categories.write",
  "product_tags.read",
  "product_tags.write",
  "handlers.read",
  "handlers.write",
  "clubs.read",
  "clubs.write",
  "users.read",
  "users.write",
  "content.read",
  "content.write",
  "chats.service",
  "chats.player",
  "chats.reply",
  "feedbacks.read",
  "after_sales.read",
  "after_sales.write",
  "admin_users.read",
  "admin_users.write",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  "operations.read": "运营概览",
  "analytics.read": "数据分析",
  "orders.read": "查看订单",
  "orders.mine": "我的订单（仅本人被指派的订单）",
  "orders.write": "编辑订单",
  "orders.accept": "接单大厅",
  "orders.dispatch": "订单派单",
  "products.read": "查看商品",
  "products.write": "编辑商品",
  "categories.read": "分类管理",
  "categories.write": "编辑分类",
  "product_tags.read": "标签管理",
  "product_tags.write": "编辑标签",
  "handlers.read": "打手管理",
  "handlers.write": "编辑打手",
  "clubs.read": "俱乐部管理",
  "clubs.write": "编辑俱乐部",
  "users.read": "用户管理",
  "users.write": "编辑用户",
  "content.read": "内容管理",
  "content.write": "编辑内容",
  "chats.service": "客服会话",
  "chats.player": "打手会话",
  "chats.reply": "回复消息",
  "feedbacks.read": "意见反馈",
  "after_sales.read": "售后工单",
  "after_sales.write": "处理售后",
  "admin_users.read": "查看后台账号",
  "admin_users.write": "管理后台账号",
};

export const PERMISSION_GROUPS: { label: string; permissions: AdminPermission[] }[] = [
  {
    label: "运营与数据",
    permissions: ["operations.read", "analytics.read"],
  },
  {
    label: "订单与售后",
    permissions: [
      "orders.read",
      "orders.mine",
      "orders.write",
      "orders.accept",
      "orders.dispatch",
      "after_sales.read",
      "after_sales.write",
    ],
  },
  {
    label: "商品与分类",
    permissions: [
      "products.read",
      "products.write",
      "categories.read",
      "categories.write",
      "product_tags.read",
      "product_tags.write",
    ],
  },
  {
    label: "人员管理",
    permissions: [
      "handlers.read",
      "handlers.write",
      "clubs.read",
      "clubs.write",
      "users.read",
      "users.write",
    ],
  },
  {
    label: "内容与客服",
    permissions: [
      "content.read",
      "content.write",
      "chats.service",
      "chats.player",
      "chats.reply",
      "feedbacks.read",
    ],
  },
  {
    label: "系统管理",
    permissions: ["admin_users.read", "admin_users.write"],
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  super_admin: ADMIN_PERMISSIONS,
  operator: [
    "operations.read",
    "analytics.read",
    "orders.read",
    "orders.write",
    "orders.accept",
    "orders.dispatch",
    "products.read",
    "products.write",
    "categories.read",
    "categories.write",
    "product_tags.read",
    "product_tags.write",
    "handlers.read",
    "handlers.write",
    "clubs.read",
    "clubs.write",
    "users.read",
    "content.read",
    "content.write",
    "after_sales.read",
    "after_sales.write",
  ],
  cs: [
    "operations.read",
    "chats.service",
    "chats.reply",
    "feedbacks.read",
    "after_sales.read",
    "after_sales.write",
    "orders.read",
    "orders.dispatch",
    "orders.write",
  ],
  handler: [
    "orders.mine",
    "orders.accept",
    "chats.player",
    "chats.reply",
  ],
  companion: [
    "orders.mine",
    "orders.accept",
    "chats.player",
    "chats.reply",
  ],
};

const permissionSet = new Set<string>(ADMIN_PERMISSIONS);

export function isValidAdminPermission(value: string): value is AdminPermission {
  return permissionSet.has(value);
}

export function isValidAdminRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}

export function isServiceProviderRole(role: AdminRole) {
  return role === "handler" || role === "companion";
}

/** 兼容历史 analyst 角色标识 */
export function normalizeAdminRole(value: string): AdminRole | null {
  if (value === "analyst") return "handler";
  return isValidAdminRole(value) ? value : null;
}

export function normalizeAdminRoles(roles: string[]): AdminRole[] {
  const result: AdminRole[] = [];
  for (const role of roles) {
    const normalized = normalizeAdminRole(role);
    if (normalized && !result.includes(normalized)) {
      result.push(normalized);
    }
  }
  return result;
}

export function roleLabels(roles: AdminRole[]): string[] {
  return roles.map((role) => ADMIN_ROLE_LABELS[role] ?? role);
}

export function permissionLabel(id: string): string {
  return PERMISSION_LABELS[id as AdminPermission] ?? id;
}

export function roleOptions() {
  return ADMIN_ROLES.map((id) => ({ id, label: ADMIN_ROLE_LABELS[id] }));
}

export function isEditableRole(role: AdminRole) {
  return role !== "super_admin";
}

/** 比较两组权限是否相同（顺序无关） */
export function permissionsEqual(a: readonly string[], b: readonly string[]) {
  return [...a].sort().join(",") === [...b].sort().join(",");
}

export function avatarInitial(displayName: string, fallback = "管") {
  const text = displayName.trim().charAt(0) || fallback.charAt(0);
  return text || fallback;
}

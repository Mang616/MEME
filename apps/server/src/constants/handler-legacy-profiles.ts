import type { AdminUser, Handler } from "../types.js";
import { rolesForHandlerProfile } from "../lib/service-provider-role.js";

/** 种子打手 h1–h6 的完整档案（升级旧库时按 id 回填） */
export const HANDLER_LEGACY_PROFILES: Record<
  string,
  Pick<Handler, "realName" | "idNumber" | "phone" | "wechat" | "alipay">
> = {
  h1: {
    realName: "张贰拾",
    idNumber: "110101199003031234",
    phone: "13800138001",
    wechat: "dashou_h1",
    alipay: "13800138001",
  },
  h2: {
    realName: "李晓明",
    idNumber: "110101199105051234",
    phone: "13800138002",
    wechat: "lixm_h2",
    alipay: "13800138002",
  },
  h3: {
    realName: "王强",
    idNumber: "110101199206061234",
    phone: "13800138003",
    wechat: "wangq_h3",
    alipay: "13800138003",
  },
  h4: {
    realName: "陈杰",
    idNumber: "110101199307071234",
    phone: "13800138004",
    wechat: "chenj_h4",
    alipay: "13800138004",
  },
  h5: {
    realName: "赵小七",
    idNumber: "110101199408081234",
    phone: "13800138005",
    wechat: "zhaoq_h5",
    alipay: "13800138005",
  },
  h6: {
    realName: "刘凯",
    idNumber: "110101199509091234",
    phone: "13800138006",
    wechat: "liuk_h6",
    alipay: "13800138006",
  },
};

/** 种子打手/陪玩 id 对应的服务类型 */
export const HANDLER_LEGACY_SERVICE_TYPES: Record<string, Handler["serviceType"]> = {
  h1: "escort",
  h2: "escort",
  h3: "companion",
  h4: "escort",
  h5: "companion",
  h6: "companion",
};
export const HANDLER_LEGACY_ADMIN_ACCOUNTS: Record<
  string,
  { id: string; username: string; password: string; displayName: string }
> = {
  h1: { id: "admin_handler", username: "dashou", password: "dashou123", displayName: "魔王s 贰拾" },
  h2: { id: "admin_handler_h2", username: "lixiaoming", password: "handler123", displayName: "选手小李" },
  h3: { id: "admin_handler_h3", username: "wangqiang", password: "handler123", displayName: "选手小王" },
  h4: { id: "admin_handler_h4", username: "chenjie", password: "handler123", displayName: "阿杰" },
  h5: { id: "admin_handler_h5", username: "zhaoqi", password: "handler123", displayName: "小七" },
  h6: { id: "admin_handler_h6", username: "liukai", password: "handler123", displayName: "老K" },
};

export function buildHandlerAdminUser(
  handler: Pick<Handler, "id" | "name" | "realName" | "serviceType">,
  createdAt: string,
  hashPassword: (plain: string) => string,
): AdminUser {
  const roles = rolesForHandlerProfile(handler.serviceType);
  const preset = HANDLER_LEGACY_ADMIN_ACCOUNTS[handler.id];
  if (preset) {
    return {
      id: preset.id,
      username: preset.username,
      passwordHash: hashPassword(preset.password),
      displayName: preset.displayName || handler.name?.trim() || handler.realName?.trim() || "",
      roles,
      enabled: true,
      createdAt,
      handlerId: handler.id,
    };
  }
  return {
    id: `adm_handler_${handler.id}`,
    username: `handler_${handler.id}`,
    passwordHash: hashPassword("handler123"),
    displayName: handler.name?.trim() || handler.realName?.trim() || "",
    roles,
    enabled: true,
    createdAt,
    handlerId: handler.id,
  };
}

export function mergeHandlerLegacyProfile(handler: Handler): Handler {
  const legacy = HANDLER_LEGACY_PROFILES[handler.id];
  if (!legacy) return handler;
  return {
    ...handler,
    realName: handler.realName?.trim() || legacy.realName,
    idNumber: handler.idNumber?.trim() || legacy.idNumber,
    phone: handler.phone?.trim() || legacy.phone,
    wechat: handler.wechat?.trim() || legacy.wechat,
    alipay: handler.alipay?.trim() || legacy.alipay,
  };
}

/** 按种子预设 id / 用户名反查打手档案 id（用于修复未绑定的 dashou 等账号） */
export function legacyHandlerIdForAdminUser(
  user: Pick<AdminUser, "id" | "username">,
): string | null {
  for (const [handlerId, preset] of Object.entries(HANDLER_LEGACY_ADMIN_ACCOUNTS)) {
    if (user.id === preset.id || user.username === preset.username) {
      return handlerId;
    }
  }
  return null;
}

export function legacyAdminPresetForHandler(handlerId: string) {
  return HANDLER_LEGACY_ADMIN_ACCOUNTS[handlerId] ?? null;
}

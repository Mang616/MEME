import type { NextFunction, Response } from "express";
import { getAdminUser, getHandler } from "../db/index.js";
import { isLinkedServiceProviderAccount } from "../lib/service-provider-role.js";
import type { AuthedRequest } from "./auth.js";
import type { Handler } from "../types.js";

export type ServiceProviderAuthedRequest = AuthedRequest & {
  serviceProviderHandler: Handler;
};

/** 仅允许已绑定打手/陪玩档案的服务者访问（配合 orders.mine 等接口） */
export async function requireLinkedServiceProvider(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const admin = req.admin;
  if (!admin) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "未登录" });
    return;
  }

  if (!admin.permissions.includes("orders.mine")) {
    res.status(403).json({ error: "FORBIDDEN", message: "无权限访问我的订单" });
    return;
  }

  const user = await getAdminUser(admin.adminId);
  if (!isLinkedServiceProviderAccount(user)) {
    res.status(403).json({
      error: "HANDLER_PROFILE_REQUIRED",
      message: "账号未绑定打手/陪玩档案，请联系管理员在「后台用户」中绑定",
    });
    return;
  }

  const handler = await getHandler(user!.handlerId!);
  if (!handler) {
    res.status(403).json({
      error: "HANDLER_PROFILE_NOT_FOUND",
      message: "绑定的打手/陪玩档案不存在，请联系管理员重新绑定",
    });
    return;
  }

  (req as ServiceProviderAuthedRequest).serviceProviderHandler = handler;
  next();
}

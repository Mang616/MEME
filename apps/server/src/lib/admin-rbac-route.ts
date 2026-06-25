import type { Request, Response } from "express";
import { ADMIN_ROLES, type AdminRole } from "../constants/admin-rbac.js";

export function parseAdminRoleParam(value: string): AdminRole | null {
  return ADMIN_ROLES.includes(value as AdminRole) ? (value as AdminRole) : null;
}

export function respondInvalidRole(res: Response) {
  res.status(400).json({ error: "INVALID_ROLE", message: "无效角色" });
}

export function respondSuperAdminLocked(res: Response) {
  res.status(400).json({ error: "INVALID_ROLE", message: "超级管理员权限不可修改" });
}

/** 包装权限矩阵写操作，统一角色校验与 SUPER_ADMIN_LOCKED 处理 */
export async function withEditableRole(
  req: Request,
  res: Response,
  handler: (role: AdminRole) => Promise<unknown>,
) {
  const role = parseAdminRoleParam(String(req.params.role));
  if (!role) {
    respondInvalidRole(res);
    return;
  }

  try {
    const result = await handler(role);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "SUPER_ADMIN_LOCKED") {
      respondSuperAdminLocked(res);
      return;
    }
    throw err;
  }
}

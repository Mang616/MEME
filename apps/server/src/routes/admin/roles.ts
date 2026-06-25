import { Router } from "express";
import { requireAdmin, requirePermission } from "../../middleware/auth.js";
import { rolePermissionService } from "../../services/role-permissions.js";

export const adminRolesRouter = Router();

adminRolesRouter.use(requireAdmin);

adminRolesRouter.get("/", requirePermission("admin_users.read"), (_req, res) => {
  res.json(rolePermissionService.listRoles());
});

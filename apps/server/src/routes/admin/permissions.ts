import { Router } from "express";
import { z } from "zod";
import { withEditableRole } from "../../lib/admin-rbac-route.js";
import { requireAdmin, requirePermission } from "../../middleware/auth.js";
import { rolePermissionService } from "../../services/role-permissions.js";

const updateSchema = z.object({
  permissions: z.array(z.string()),
});

export const adminPermissionsRouter = Router();

adminPermissionsRouter.use(requireAdmin);

adminPermissionsRouter.get("/", requirePermission("admin_users.read"), (_req, res) => {
  res.json(rolePermissionService.getMatrix());
});

adminPermissionsRouter.put("/:role", requirePermission("admin_users.write"), async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "权限参数错误" });
    return;
  }

  await withEditableRole(req, res, (role) =>
    rolePermissionService.updateRole(role, parsed.data.permissions),
  );
});

adminPermissionsRouter.post("/:role/reset", requirePermission("admin_users.write"), async (req, res) => {
  await withEditableRole(req, res, (role) => rolePermissionService.resetRole(role));
});

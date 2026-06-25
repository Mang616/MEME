import { Router } from "express";
import { z } from "zod";
import { userService } from "../../services/cms.js";

const userPatchSchema = z.object({
  nickname: z.string().min(1).optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  vipLevel: z.number().int().min(0).optional(),
  balance: z.number().min(0).optional(),
  status: z.enum(["active", "disabled"]).optional(),
});

export const adminUsersRouter = Router();

adminUsersRouter.get("/", async (_req, res) => {
  const items = await userService.list();
  res.json({ items, total: items.length });
});

adminUsersRouter.get("/:id", async (req, res) => {
  const user = await userService.getById(req.params.id);
  if (!user) {
    res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
    return;
  }
  res.json(user);
});

adminUsersRouter.put("/:id", async (req, res) => {
  const parsed = userPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "用户参数错误" });
    return;
  }

  const updated = await userService.update(req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
    return;
  }

  res.json(updated);
});

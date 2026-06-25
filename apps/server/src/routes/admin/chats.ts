import { Router } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../../middleware/auth.js";
import { requireAdmin, requireAnyPermission, requirePermission } from "../../middleware/auth.js";
import { adminSupportService } from "../../services/admin-support.js";

const replySchema = z.object({
  content: z.string().min(1).max(2000),
});

export const adminChatsRouter = Router();

adminChatsRouter.use(requireAdmin);

adminChatsRouter.get("/", requireAnyPermission("chats.service", "chats.player"), async (req, res) => {
  const admin = (req as AuthedRequest).admin!;
  const items = await adminSupportService.listChatRows(admin.roles);
  res.json({ items, total: items.length });
});

adminChatsRouter.get(
  "/:id/messages",
  requireAnyPermission("chats.service", "chats.player"),
  async (req, res) => {
    const admin = (req as AuthedRequest).admin!;
    const detail = await adminSupportService.getChatMessages(
      String(req.params.id),
      admin.roles,
      admin.displayName,
    );
    if (!detail) {
      res.status(404).json({ error: "NOT_FOUND", message: "会话不存在或无权查看" });
      return;
    }
    res.json(detail);
  },
);

adminChatsRouter.post("/:id/messages", requirePermission("chats.reply"), async (req, res) => {
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "消息内容无效" });
    return;
  }

  const admin = (req as AuthedRequest).admin!;
  try {
    const message = await adminSupportService.replyChat(
      String(req.params.id),
      admin.roles,
      admin.adminId,
      parsed.data.content,
      admin.displayName,
    );
    res.status(201).json(message);
  } catch (err) {
    if (err instanceof Error && err.message === "CHAT_NOT_FOUND") {
      res.status(404).json({ error: "NOT_FOUND", message: "会话不存在或无权回复" });
      return;
    }
    throw err;
  }
});

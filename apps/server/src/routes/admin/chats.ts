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
  const items = await adminSupportService.listChatRows(admin.roles, admin.handlerId);
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
      admin.handlerId,
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
      admin.handlerId,
    );
    res.status(201).json(message);
  } catch (err) {
    if (err instanceof Error && err.message === "CHAT_NOT_FOUND") {
      res.status(404).json({ error: "NOT_FOUND", message: "会话不存在或无权回复" });
      return;
    }
    if (err instanceof Error && err.message === "CHAT_CLOSED") {
      res.status(409).json({ error: "CHAT_CLOSED", message: "会话已结束，无法发送消息" });
      return;
    }
    throw err;
  }
});

adminChatsRouter.post("/:id/close", requirePermission("chats.reply"), async (req, res) => {
  const admin = (req as AuthedRequest).admin!;
  try {
    const row = await adminSupportService.closeChat(
      String(req.params.id),
      admin.roles,
      admin.handlerId,
    );
    res.json(row);
  } catch (err) {
    if (err instanceof Error && err.message === "CHAT_NOT_FOUND") {
      res.status(404).json({ error: "NOT_FOUND", message: "会话不存在或无权操作" });
      return;
    }
    if (err instanceof Error && err.message === "CHAT_CLOSE_NOT_ALLOWED") {
      res.status(400).json({ error: "CHAT_CLOSE_NOT_ALLOWED", message: "客服会话不可终止" });
      return;
    }
    throw err;
  }
});

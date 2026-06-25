import { Router } from "express";
import { z } from "zod";
import { paramString } from "../../lib/request-params.js";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import { clubService } from "../../services/clubs.js";

const clubBodySchema = z.object({
  id: z.string().min(1).max(64).optional(),
  name: z.string().min(1).max(128),
  kind: z.enum(["platform", "partner"]).default("partner"),
  contactName: z.string().default(""),
  contactPhone: z.string().default(""),
  description: z.string().default(""),
  enabled: z.boolean().default(true),
});

const clubPatchSchema = clubBodySchema.partial().omit({ id: true, kind: true });

export const adminClubsRouter = Router();

adminClubsRouter.get("/", requireRead(...adminApiPolicy.clubs.read), async (_req, res) => {
  const items = await clubService.listAdminRows();
  res.json({ items, total: items.length });
});

adminClubsRouter.get("/:id", requireRead(...adminApiPolicy.clubs.read), async (req, res) => {
  const club = await clubService.getById(paramString(req.params.id));
  if (!club) {
    res.status(404).json({ error: "NOT_FOUND", message: "俱乐部不存在" });
    return;
  }
  res.json(club);
});

adminClubsRouter.post("/", requireWrite(...adminApiPolicy.clubs.write), async (req, res) => {
  const parsed = clubBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "俱乐部参数错误" });
    return;
  }

  if (parsed.data.kind === "platform") {
    res.status(400).json({ error: "INVALID_BODY", message: "平台自营俱乐部不可新增" });
    return;
  }

  try {
    const created = await clubService.create({
      ...parsed.data,
      id: parsed.data.id,
    });
    const row = await clubService.getAdminRowById(created.id);
    res.status(201).json(row);
  } catch (err) {
    if (err instanceof Error && err.message === "CLUB_EXISTS") {
      res.status(409).json({ error: "CONFLICT", message: "俱乐部 ID 已存在" });
      return;
    }
    throw err;
  }
});

adminClubsRouter.put("/:id", requireWrite(...adminApiPolicy.clubs.write), async (req, res) => {
  const parsed = clubPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "俱乐部参数错误" });
    return;
  }

  try {
    const updated = await clubService.update(paramString(req.params.id), parsed.data);
    if (!updated) {
      res.status(404).json({ error: "NOT_FOUND", message: "俱乐部不存在" });
      return;
    }
    const row = await clubService.getAdminRowById(updated.id);
    res.json(row);
  } catch (err) {
    if (err instanceof Error && err.message === "PLATFORM_CLUB_LOCKED") {
      res.status(403).json({ error: "FORBIDDEN", message: "平台自营俱乐部不可修改类型或删除" });
      return;
    }
    throw err;
  }
});

adminClubsRouter.patch("/:id/enabled", requireWrite(...adminApiPolicy.clubs.write), async (req, res) => {
  const parsed = z.object({ enabled: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "参数错误" });
    return;
  }

  const updated = await clubService.update(paramString(req.params.id), { enabled: parsed.data.enabled });
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "俱乐部不存在" });
    return;
  }
  const row = await clubService.getAdminRowById(updated.id);
  res.json(row);
});

adminClubsRouter.delete("/:id", requireWrite(...adminApiPolicy.clubs.write), async (req, res) => {
  try {
    const ok = await clubService.remove(paramString(req.params.id));
    if (!ok) {
      res.status(404).json({ error: "NOT_FOUND", message: "俱乐部不存在" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "PLATFORM_CLUB_LOCKED") {
        res.status(403).json({ error: "FORBIDDEN", message: "平台自营俱乐部不可删除" });
        return;
      }
      if (err.message === "CLUB_HAS_HANDLERS") {
        res.status(409).json({ error: "CONFLICT", message: "俱乐部下仍有打手，无法删除" });
        return;
      }
    }
    throw err;
  }
});

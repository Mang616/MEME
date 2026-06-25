import { Router } from "express";
import { z } from "zod";
import { paramString } from "../../lib/request-params.js";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import { productTagService } from "../../services/product-tags.js";

const tagBodySchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(64),
  style: z.enum(["recommend", "new"]),
  sortOrder: z.number().int().nonnegative().default(0),
  enabled: z.boolean().default(true),
});

const tagPatchSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  style: z.enum(["recommend", "new"]).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  enabled: z.boolean().optional(),
});

export const adminProductTagsRouter = Router();

adminProductTagsRouter.get("/", requireRead(...adminApiPolicy.productTags.read), async (_req, res) => {
  const items = await productTagService.listAdminRows();
  res.json({ items, total: items.length });
});

adminProductTagsRouter.post("/", requireWrite(...adminApiPolicy.productTags.write), async (req, res) => {
  const parsed = tagBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "标签参数错误" });
    return;
  }

  try {
    const created = await productTagService.create(parsed.data);
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "TAG_EXISTS") {
        res.status(409).json({ error: "CONFLICT", message: "标签 ID 已存在" });
        return;
      }
      if (err.message === "TAG_NAME_EXISTS") {
        res.status(409).json({ error: "CONFLICT", message: "标签名称已存在" });
        return;
      }
      if (err.message === "INVALID_TAG_ID") {
        res.status(400).json({
          error: "INVALID_BODY",
          message: "标签 ID 仅支持小写字母、数字、下划线与连字符，且以字母开头",
        });
        return;
      }
    }
    throw err;
  }
});

adminProductTagsRouter.put("/:id", requireWrite(...adminApiPolicy.productTags.write), async (req, res) => {
  const parsed = tagPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "标签参数错误" });
    return;
  }

  try {
    const updated = await productTagService.update(paramString(req.params.id), parsed.data);
    if (!updated) {
      res.status(404).json({ error: "NOT_FOUND", message: "标签不存在" });
      return;
    }
    res.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "TAG_NAME_EXISTS") {
      res.status(409).json({ error: "CONFLICT", message: "标签名称已存在" });
      return;
    }
    throw err;
  }
});

adminProductTagsRouter.delete("/:id", requireWrite(...adminApiPolicy.productTags.write), async (req, res) => {
  try {
    const ok = await productTagService.remove(paramString(req.params.id));
    if (!ok) {
      res.status(404).json({ error: "NOT_FOUND", message: "标签不存在" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    if (err instanceof Error && err.message === "TAG_IN_USE") {
      res.status(409).json({ error: "CONFLICT", message: "仍有商品使用该标签，无法删除" });
      return;
    }
    throw err;
  }
});

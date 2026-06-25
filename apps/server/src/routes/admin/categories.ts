import { Router } from "express";
import { z } from "zod";
import { paramString } from "../../lib/request-params.js";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import { categoryService } from "../../services/categories.js";

const categoryBodySchema = z.object({
  serviceType: z.enum(["escort", "companion"]),
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
});

const categoryPatchSchema = z.object({
  name: z.string().min(1).max(128),
});

export const adminCategoriesRouter = Router();

adminCategoriesRouter.get("/", requireRead(...adminApiPolicy.categories.read), async (_req, res) => {
  const items = await categoryService.listAdminRows();
  res.json({ items, total: items.length });
});

adminCategoriesRouter.post("/", requireWrite(...adminApiPolicy.categories.write), async (req, res) => {
  const parsed = categoryBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "分类参数错误" });
    return;
  }

  try {
    const created = await categoryService.create(parsed.data);
    res.status(201).json(created);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "CATEGORY_EXISTS") {
        res.status(409).json({ error: "CONFLICT", message: "分类 ID 已存在" });
        return;
      }
      if (err.message === "INVALID_CATEGORY_ID") {
        res.status(400).json({
          error: "INVALID_BODY",
          message: "分类 ID 仅支持小写字母、数字、下划线与连字符，且以字母开头",
        });
        return;
      }
    }
    throw err;
  }
});

adminCategoriesRouter.put("/:serviceType/:id", requireWrite(...adminApiPolicy.categories.write), async (req, res) => {
  const serviceType = paramString(req.params.serviceType);
  if (serviceType !== "escort" && serviceType !== "companion") {
    res.status(400).json({ error: "INVALID_BODY", message: "服务类型无效" });
    return;
  }

  const parsed = categoryPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "分类参数错误" });
    return;
  }

  const updated = await categoryService.update(serviceType, paramString(req.params.id), parsed.data);
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "分类不存在" });
    return;
  }

  res.json(updated);
});

adminCategoriesRouter.delete("/:serviceType/:id", requireWrite(...adminApiPolicy.categories.write), async (req, res) => {
  const serviceType = paramString(req.params.serviceType);
  if (serviceType !== "escort" && serviceType !== "companion") {
    res.status(400).json({ error: "INVALID_BODY", message: "服务类型无效" });
    return;
  }

  try {
    const ok = await categoryService.remove(serviceType, paramString(req.params.id));
    if (!ok) {
      res.status(404).json({ error: "NOT_FOUND", message: "分类不存在" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    if (err instanceof Error && err.message === "CATEGORY_IN_USE") {
      res.status(409).json({ error: "CONFLICT", message: "该分类下仍有商品，无法删除" });
      return;
    }
    throw err;
  }
});

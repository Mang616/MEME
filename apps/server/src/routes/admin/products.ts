import { Router } from "express";
import { z } from "zod";
import { paramString } from "../../lib/request-params.js";
import { adminApiPolicy, requireRead, requireWrite } from "../../middleware/admin-api-policy.js";
import { catalogService, productService } from "../../services.js";

const productBodySchema = z.object({
  title: z.string().min(1),
  serviceType: z.enum(["escort", "companion"]),
  categoryId: z.string().min(1),
  desc: z.string().default(""),
  price: z.number().nonnegative(),
  sold: z.number().int().nonnegative().default(0),
  tag: z.string().default(""),
  cover: z.string().default(""),
  coverColor: z.string().default("#2a3530"),
  heroTitle: z.string().default(""),
  heroSubtitle: z.string().default(""),
  detailDesc: z.string().default(""),
  views: z.number().int().nonnegative().default(0),
  reviewCount: z.number().int().nonnegative().default(0),
  positiveRate: z.number().int().min(0).max(100).default(90),
  intro: z.string().default(""),
  limitPerUser: z.number().int().nonnegative().default(0),
  couponAllowed: z.boolean().default(true),
  published: z.boolean().default(true),
});

export const adminProductsRouter = Router();

adminProductsRouter.get("/", requireRead(...adminApiPolicy.products.read), async (_req, res) => {
  const items = await productService.listAdminRows();
  res.json({ items, total: items.length });
});

adminProductsRouter.get("/categories", requireRead(...adminApiPolicy.products.read), async (_req, res) => {
  const catalog = await catalogService.getCatalog();
  res.json(catalog.subCategories);
});

adminProductsRouter.get("/:id", requireRead(...adminApiPolicy.products.read), async (req, res) => {
  const product = await productService.getById(paramString(req.params.id));
  if (!product) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
    return;
  }
  res.json(product);
});

adminProductsRouter.post("/", requireWrite(...adminApiPolicy.products.write), async (req, res) => {
  const parsed = productBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "商品参数错误" });
    return;
  }

  try {
    const product = await productService.create({
      ...parsed.data,
      heroTitle: parsed.data.heroTitle || parsed.data.title,
      heroSubtitle: parsed.data.heroSubtitle || parsed.data.desc,
      detailDesc: parsed.data.detailDesc || parsed.data.desc,
      intro: parsed.data.intro || parsed.data.desc,
    });
    res.status(201).json(await productService.toAdminRow(product));
  } catch (err) {
    if (err instanceof Error && err.message === "PRODUCT_EXISTS") {
      res.status(409).json({ error: "CONFLICT", message: "商品 ID 已存在" });
      return;
    }
    if (err instanceof Error && err.message === "INVALID_CATEGORY") {
      res.status(400).json({ error: "INVALID_BODY", message: "所选分类不存在或与类型不匹配" });
      return;
    }
    if (err instanceof Error && err.message === "INVALID_TAG") {
      res.status(400).json({ error: "INVALID_BODY", message: "所选标签不存在或已停用" });
      return;
    }
    throw err;
  }
});

adminProductsRouter.put("/:id", requireWrite(...adminApiPolicy.products.write), async (req, res) => {
  const parsed = productBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "商品参数错误" });
    return;
  }

  try {
    const updated = await productService.update(paramString(req.params.id), parsed.data);
    if (!updated) {
      res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
      return;
    }

    res.json(await productService.toAdminRow(updated));
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CATEGORY") {
      res.status(400).json({ error: "INVALID_BODY", message: "所选分类不存在或与类型不匹配" });
      return;
    }
    if (err instanceof Error && err.message === "INVALID_TAG") {
      res.status(400).json({ error: "INVALID_BODY", message: "所选标签不存在或已停用" });
      return;
    }
    throw err;
  }
});

adminProductsRouter.delete("/:id", requireWrite(...adminApiPolicy.products.write), async (req, res) => {
  const ok = await productService.remove(paramString(req.params.id));
  if (!ok) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
    return;
  }
  res.status(204).end();
});

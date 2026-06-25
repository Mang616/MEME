import { Router } from "express";
import { z } from "zod";
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
  published: z.boolean().default(true),
});

export const adminProductsRouter = Router();

adminProductsRouter.get("/", async (_req, res) => {
  const items = await productService.listAdminRows();
  res.json({ items, total: items.length });
});

adminProductsRouter.get("/categories", async (_req, res) => {
  const catalog = await catalogService.getCatalog();
  res.json(catalog.subCategories);
});

adminProductsRouter.get("/:id", async (req, res) => {
  const product = await productService.getById(req.params.id);
  if (!product) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
    return;
  }
  res.json(product);
});

adminProductsRouter.post("/", async (req, res) => {
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
    throw err;
  }
});

adminProductsRouter.put("/:id", async (req, res) => {
  const parsed = productBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "商品参数错误" });
    return;
  }

  const updated = await productService.update(req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
    return;
  }

  res.json(await productService.toAdminRow(updated));
});

adminProductsRouter.delete("/:id", async (req, res) => {
  const ok = await productService.remove(req.params.id);
  if (!ok) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
    return;
  }
  res.status(204).end();
});

import { Router } from "express";
import { z } from "zod";
import { ORDER_REGIONS } from "../constants.js";
import { catalogService, handlerService, orderService, productService } from "../services.js";

export const publicCatalogRouter = Router();

publicCatalogRouter.get("/", async (_req, res) => {
  const catalog = await catalogService.getCatalog();
  res.json(catalog);
});

export const publicProductsRouter = Router();

publicProductsRouter.get("/", async (_req, res) => {
  const items = await productService.listPublished();
  res.json({ items, total: items.length });
});

publicProductsRouter.get("/:id", async (req, res) => {
  const product = await productService.getById(req.params.id);
  if (!product || product.published === false) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
    return;
  }
  res.json(product);
});

export const publicHandlersRouter = Router();

publicHandlersRouter.get("/", async (_req, res) => {
  const items = await handlerService.list();
  res.json({ items, total: items.length });
});

export const publicOrdersRouter = Router();

const createOrderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  region: z.enum(ORDER_REGIONS),
  userId: z.string().min(2),
  assignedPlayer: z.string().min(1),
  remark: z.string().optional(),
  product: z.object({
    title: z.string().min(1),
    desc: z.string().optional(),
    price: z.number().nonnegative(),
    cover: z.string().optional(),
    coverColor: z.string().optional(),
  }),
});

publicOrdersRouter.get("/", async (req, res) => {
  const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
  const items = await orderService.list(userId);
  res.json({ items, total: items.length });
});

publicOrdersRouter.get("/:id", async (req, res) => {
  const order = await orderService.getById(req.params.id);
  if (!order) {
    res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
    return;
  }
  res.json(order);
});

publicOrdersRouter.post("/", async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "订单参数错误" });
    return;
  }

  const product = await productService.getById(parsed.data.productId);
  if (!product || product.published === false) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在或已下架" });
    return;
  }

  const order = await orderService.create({
    ...parsed.data,
    product: {
      title: product.title,
      desc: product.desc,
      price: product.price,
      cover: product.cover,
      coverColor: product.coverColor,
    },
  });

  res.status(201).json(order);
});

import { Router } from "express";
import { z } from "zod";
import { ORDER_REGIONS } from "../constants.js";
import { catalogService, handlerService, orderService, productService } from "../services/index.js";
import { announcementService, bannerService } from "../services/index.js";
import {
  withResolvedBanners,
  withResolvedContentPage,
  withResolvedOrder,
  withResolvedOrders,
  withResolvedProduct,
  withResolvedProducts,
} from "../lib/resolve-media.js";
import {
  contentService,
  feedbackService,
  reviewService,
} from "../services/app.js";
import { chatDomainService } from "../services/chat.js";
import { getOptionalUserId, requireUser } from "../middleware/auth.js";

export const publicCatalogRouter = Router();

publicCatalogRouter.get("/", async (_req, res) => {
  const catalog = await catalogService.getCatalog();
  res.json(catalog);
});

export const publicProductsRouter = Router();

publicProductsRouter.get("/", async (_req, res) => {
  const items = await withResolvedProducts(await productService.listPublished());
  res.json({ items, total: items.length });
});

publicProductsRouter.get("/:id/reviews", async (req, res) => {
  const product = await productService.getById(req.params.id);
  if (!product || product.published === false) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
    return;
  }
  const items = await reviewService.listByProduct(req.params.id);
  res.json({ items, total: items.length });
});

publicProductsRouter.get("/:id", async (req, res) => {
  const product = await productService.getById(req.params.id);
  if (!product || product.published === false) {
    res.status(404).json({ error: "NOT_FOUND", message: "商品不存在" });
    return;
  }
  res.json(await withResolvedProduct(product));
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
  userCouponId: z.string().optional(),
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
  const items = await withResolvedOrders(await orderService.list(userId));
  res.json({ items, total: items.length });
});

publicOrdersRouter.get("/:id", async (req, res) => {
  const order = await orderService.getById(req.params.id);
  if (!order) {
    res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
    return;
  }
  res.json(await withResolvedOrder(order));
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

  const ownerUserId = getOptionalUserId(req) ?? undefined;

  try {
    const order = await orderService.create({
      ...parsed.data,
      ownerUserId,
      product: {
        title: product.title,
        desc: product.desc,
        price: product.price,
        cover: product.cover,
        coverColor: product.coverColor,
      },
    });

    res.status(201).json(await withResolvedOrder(order));
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      res.status(400).json({ error: "INSUFFICIENT_BALANCE", message: "余额不足，请先充值" });
      return;
    }
    if (err instanceof Error && err.message === "USER_NOT_FOUND") {
      res.status(404).json({ error: "NOT_FOUND", message: "用户不存在" });
      return;
    }
    if (err instanceof Error && err.message === "COUPON_NOT_FOUND") {
      res.status(400).json({ error: "COUPON_NOT_FOUND", message: "优惠券不存在" });
      return;
    }
    if (err instanceof Error && err.message === "COUPON_UNAVAILABLE") {
      res.status(400).json({ error: "COUPON_UNAVAILABLE", message: "优惠券已使用或已过期" });
      return;
    }
    if (err instanceof Error && err.message === "COUPON_NOT_APPLICABLE") {
      res.status(400).json({ error: "COUPON_NOT_APPLICABLE", message: "当前订单不满足优惠券使用条件" });
      return;
    }
    throw err;
  }
});

export const publicBannersRouter = Router();

publicBannersRouter.get("/", async (_req, res) => {
  const items = await withResolvedBanners(await bannerService.listPublished());
  res.json({ items, total: items.length });
});

export const publicAnnouncementsRouter = Router();

publicAnnouncementsRouter.get("/", async (req, res) => {
  const placement = typeof req.query.placement === "string" ? req.query.placement : undefined;
  const items = await announcementService.listActive(
    placement as "home_bar" | "popup" | undefined,
  );
  res.json({ items, total: items.length });
});

export const publicContentRouter = Router();

publicContentRouter.get("/:slug", async (req, res) => {
  const page = await contentService.getBySlug(req.params.slug);
  if (!page) {
    res.status(404).json({ error: "NOT_FOUND", message: "内容不存在" });
    return;
  }
  res.json(await withResolvedContentPage(page));
});

export const publicChatsRouter = Router();

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

publicChatsRouter.get("/conversations", requireUser, async (req, res) => {
  const userId = (req as typeof req & { userId: string }).userId;
  const items = await chatDomainService.listForUser(userId);
  res.json({ items, total: items.length });
});

publicChatsRouter.post("/service/ensure", requireUser, async (req, res) => {
  const userId = (req as typeof req & { userId: string }).userId;
  const conversation = await chatDomainService.ensureServiceConversation(userId);
  res.json(conversation);
});

publicChatsRouter.get("/by-order/:orderId", requireUser, async (req, res) => {
  const userId = (req as typeof req & { userId: string }).userId;
  try {
    const conversation = await chatDomainService.getOrCreateByOrder(String(req.params.orderId), userId);
    res.json(conversation);
  } catch (err) {
    if (err instanceof Error && err.message === "ORDER_NOT_FOUND") {
      res.status(404).json({ error: "NOT_FOUND", message: "订单不存在" });
      return;
    }
    if (err instanceof Error && err.message === "ORDER_FORBIDDEN") {
      res.status(403).json({ error: "FORBIDDEN", message: "无权访问该订单会话" });
      return;
    }
    throw err;
  }
});

publicChatsRouter.get("/:id/messages", requireUser, async (req, res) => {
  const userId = (req as typeof req & { userId: string }).userId;
  const detail = await chatDomainService.getMessagesForUser(String(req.params.id), userId);
  if (!detail) {
    res.status(404).json({ error: "NOT_FOUND", message: "会话不存在" });
    return;
  }
  res.json({ items: detail.items, total: detail.items.length, conversation: detail.conversation });
});

publicChatsRouter.post("/:id/messages", requireUser, async (req, res) => {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "消息内容无效" });
    return;
  }
  const userId = (req as typeof req & { userId: string }).userId;
  try {
    const message = await chatDomainService.sendUserMessage(String(req.params.id), userId, parsed.data.content);
    res.status(201).json({
      id: message.id,
      from: "self",
      type: message.type,
      content: message.content,
      time: message.time,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "CHAT_NOT_FOUND") {
      res.status(404).json({ error: "NOT_FOUND", message: "会话不存在" });
      return;
    }
    throw err;
  }
});

publicChatsRouter.post("/:id/read", requireUser, async (req, res) => {
  const userId = (req as typeof req & { userId: string }).userId;
  const updated = await chatDomainService.markReadForUser(String(req.params.id), userId);
  if (!updated) {
    res.status(404).json({ error: "NOT_FOUND", message: "会话不存在" });
    return;
  }
  res.json(updated);
});

export const publicFeedbacksRouter = Router();

const feedbackSchema = z.object({
  typeId: z.string().min(1),
  content: z.string().min(10).max(500),
  contact: z.string().optional(),
});

publicFeedbacksRouter.post("/", requireUser, async (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "INVALID_BODY", message: "反馈内容不符合要求" });
    return;
  }
  const userId = (req as typeof req & { userId: string }).userId;
  const feedback = await feedbackService.create({
    userId,
    typeId: parsed.data.typeId,
    content: parsed.data.content.trim(),
    contact: parsed.data.contact?.trim() ?? "",
  });
  res.status(201).json(feedback);
});

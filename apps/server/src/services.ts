import { AUTO_ASSIGN_LABEL, ORDER_STATUS_TEXT } from "./constants.js";
import { PLATFORM_CLUB_ID } from "./constants/clubs.js";
import {
  createHandler,
  createOrder,
  createProduct,
  getCategories,
  getClub,
  getHandler,
  getOrder,
  getProduct,
  listClubs,
  listHandlers,
  listOrders,
  listProductTags,
  listProducts,
  removeHandler,
  removeProduct,
  updateHandler,
  updateOrder,
  updateProduct,
} from "./db/index.js";
import { assertClubParticipating } from "./lib/club-participation.js";
import { assertCategoryForService } from "./services/categories.js";
import { assertProductTag } from "./services/product-tags.js";
import { chatDomainService } from "./services/chat.js";
import { payOrderWithBalance } from "./services/vip-member.js";
import {
  markUserCouponUsed,
  resolveOrderCouponPricing,
} from "./services/coupons.js";
import {
  deleteProductCover,
  syncProductCoverOnCreate,
  syncProductCoverOnUpdate,
} from "./services/cms.js";
import { cleanupReplacedMedia } from "./lib/media-lifecycle.js";
import { buildOrder, type CreateOrderInput } from "./lib/orders.js";
import { createEntity } from "./lib/create-entity.js";
import {
  toAdminHandlerRow,
  toAdminOrderRow,
  toAdminProductRow,
  toHallOrderRow,
} from "./lib/mappers.js";
import type { Handler, Order, Product } from "./types.js";

function publishedProducts(products: Product[]) {
  return products.filter((product) => product.published !== false);
}

export const catalogService = {
  async getCatalog() {
    const [subCategories, tags] = await Promise.all([getCategories(), listProductTags()]);
    const productTags = tags
      .filter((tag) => tag.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return { subCategories, productTags };
  },
};

function nextCoverRev(cover: string, previousRev = 0) {
  return cover ? Date.now() : 0;
}

export const productService = {
  async listPublished() {
    const products = await listProducts();
    return publishedProducts(products);
  },

  async getById(id: string) {
    return getProduct(id);
  },

  async create(input: Omit<Product, "id"> & { id?: string }) {
    await assertCategoryForService(input.serviceType, input.categoryId);
    await assertProductTag(input.tag);

    const entity = await createEntity({
      idPrefix: "p",
      existsError: "PRODUCT_EXISTS",
      getById: getProduct,
      create: (entity) => createProduct({ ...entity, published: entity.published ?? true }),
      input: {
        ...input,
        published: input.published ?? true,
        coverRev: input.cover ? nextCoverRev(input.cover) : 0,
      },
    });

    if (!input.cover) return entity;

    const cover = await syncProductCoverOnCreate(entity.id, input.cover);
    if (cover === input.cover) return entity;

    const coverRev = nextCoverRev(cover);
    return (await updateProduct(entity.id, { cover, coverRev })) ?? { ...entity, cover, coverRev };
  },

  async update(id: string, patch: Partial<Product>) {
    const existing = await getProduct(id);
    if (!existing) return null;

    const serviceType = patch.serviceType ?? existing.serviceType;
    const categoryId = patch.categoryId ?? existing.categoryId;
    if (patch.serviceType !== undefined || patch.categoryId !== undefined) {
      await assertCategoryForService(serviceType, categoryId);
    }

    if (patch.tag !== undefined) {
      await assertProductTag(patch.tag);
    }

    if (patch.cover === undefined) {
      return updateProduct(id, patch);
    }

    const cover = patch.cover
      ? await syncProductCoverOnUpdate(id, existing.cover, patch.cover)
      : "";
    await cleanupReplacedMedia(existing.cover, cover || undefined);
    const coverChanged = cover !== existing.cover;
    const coverRev = coverChanged ? nextCoverRev(cover, existing.coverRev) : existing.coverRev ?? 0;
    return updateProduct(id, { ...patch, cover, coverRev });
  },

  async remove(id: string) {
    const existing = await getProduct(id);
    const ok = await removeProduct(id);
    if (ok) await deleteProductCover(existing?.cover);
    return ok;
  },

  async listAdminRows() {
    const [products, categories] = await Promise.all([listProducts(), getCategories()]);
    return products.map((product) => toAdminProductRow(product, categories));
  },

  async toAdminRow(product: Product) {
    const categories = await getCategories();
    return toAdminProductRow(product, categories);
  },
};

export const orderService = {
  async list(userId?: string) {
    return listOrders(userId);
  },

  async getById(id: string) {
    return getOrder(id);
  },

  async create(input: CreateOrderInput) {
    const product = await getProduct(input.productId);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const pricing = await resolveOrderCouponPricing({
      ownerUserId: input.ownerUserId,
      userCouponId: input.userCouponId,
      product,
      quantity: input.quantity,
    });

    const order = buildOrder(input, pricing);
    if (input.ownerUserId) {
      const payer = await payOrderWithBalance(input.ownerUserId, order.totalPaid, {
        refId: order.id,
        remark: order.couponName
          ? `订单支付 · ${order.product.title}（${order.couponName}）`
          : `订单支付 · ${order.product.title}`,
      });
      if (!payer) {
        throw new Error("USER_NOT_FOUND");
      }
    }
    const created = await createOrder(order);
    if (pricing.userCouponId) {
      await markUserCouponUsed(pricing.userCouponId, created.id);
    }
    if (created.ownerUserId) {
      await chatDomainService.ensureServiceConversation(created.ownerUserId);
      await chatDomainService.syncOrderAssignment(created);
    }
    return created;
  },

  async update(
    id: string,
    patch: Partial<Pick<Order, "status" | "servicePlayer" | "statusText" | "ownerUserId">>,
  ) {
    const nextPatch = { ...patch };
    if (patch.status) {
      nextPatch.statusText = ORDER_STATUS_TEXT[patch.status];
    }
    const updated = await updateOrder(id, nextPatch);
    if (updated) {
      await chatDomainService.syncOrderAssignment(updated);
    }
    return updated;
  },

  listAdminRows(orders: Order[]) {
    return orders.map(toAdminOrderRow);
  },

  listHallRows(orders: Order[]) {
    return orders.map(toHallOrderRow);
  },

  isUnassigned(order: Order) {
    return order.servicePlayer === "—" || !order.servicePlayer.trim();
  },

  isHallEligible(order: Order) {
    return (
      order.status === "pending_accept" &&
      this.isUnassigned(order) &&
      order.assignedPlayer === AUTO_ASSIGN_LABEL
    );
  },

  isDispatchEligible(order: Order) {
    return order.status === "pending_accept" && this.isUnassigned(order);
  },

  async listHallOrders() {
    const orders = await listOrders();
    return orders.filter((order) => this.isHallEligible(order));
  },

  async listDispatchOrders() {
    const orders = await listOrders();
    return orders.filter((order) => this.isDispatchEligible(order));
  },

  async acceptOrder(id: string, playerName: string) {
    const order = await getOrder(id);
    if (!order) return null;
    if (!this.isHallEligible(order)) {
      throw new Error("ORDER_NOT_AVAILABLE");
    }
    const name = playerName.trim();
    if (!name) throw new Error("INVALID_PLAYER");
    return this.update(id, { servicePlayer: name });
  },

  async assignOrder(
    id: string,
    input: { playerName?: string; handlerId?: string },
  ) {
    const order = await getOrder(id);
    if (!order) return null;
    if (!this.isDispatchEligible(order)) {
      throw new Error("ORDER_NOT_AVAILABLE");
    }

    let playerName = input.playerName?.trim() ?? "";

    if (input.handlerId) {
      const handler = await getHandler(input.handlerId);
      if (!handler) throw new Error("HANDLER_NOT_FOUND");
      await assertClubParticipating(handler.clubId);
      playerName = handler.name;
    }

    if (!playerName) throw new Error("INVALID_PLAYER");

    const handler = (await listHandlers()).find((row) => row.name === playerName);
    if (handler) {
      await assertClubParticipating(handler.clubId);
    }

    return this.update(id, { servicePlayer: playerName });
  },
};

export const handlerService = {
  async list() {
    return listHandlers();
  },

  async getById(id: string) {
    return getHandler(id);
  },

  async create(input: Omit<Handler, "id"> & { id?: string }) {
    const club = await getClub(input.clubId || PLATFORM_CLUB_ID);
    if (!club) throw new Error("CLUB_NOT_FOUND");
    return createEntity({
      idPrefix: "h",
      existsError: "HANDLER_EXISTS",
      getById: getHandler,
      create: createHandler,
      input: {
        ...input,
        clubId: input.clubId || PLATFORM_CLUB_ID,
      },
    });
  },

  async update(id: string, patch: Partial<Handler>) {
    if (patch.clubId) {
      const club = await getClub(patch.clubId);
      if (!club) throw new Error("CLUB_NOT_FOUND");
    }
    return updateHandler(id, patch);
  },

  async remove(id: string) {
    return removeHandler(id);
  },

  async listAdminRows(handlers: Handler[]) {
    const clubs = await listClubs();
    const clubMap = new Map(clubs.map((club) => [club.id, club]));
    return handlers.map((handler) => toAdminHandlerRow(handler, clubMap.get(handler.clubId)));
  },

  async listDispatchable() {
    const [handlers, clubs] = await Promise.all([listHandlers(), listClubs()]);
    const enabledClubIds = new Set(clubs.filter((club) => club.enabled).map((club) => club.id));
    return handlers.filter((handler) => enabledClubIds.has(handler.clubId));
  },
};

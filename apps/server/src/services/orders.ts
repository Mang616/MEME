import { AUTO_ASSIGN_LABEL, ORDER_STATUS_TEXT } from "../constants.js";
import {
  createOrder,
  getAdminUser,
  getHandler,
  getOrder,
  getProduct,
  listHandlers,
  listOrders,
  listProducts,
  updateOrder,
} from "../db/index.js";
import { assertClubParticipating } from "../lib/club-participation.js";
import { chatDomainService } from "./chat.js";
import { tryGrantInviteRewardsOnOrder } from "./invite-rewards.js";
import { payOrderWithBalance } from "./vip-member.js";
import { markUserCouponUsed, resolveOrderCouponPricing } from "./coupons.js";
import { buildOrder, type CreateOrderInput } from "../lib/orders.js";
import { resolveHandlerByName, isAssignedServicePlayer, findHandlerByName } from "../lib/handler-resolve.js";
import {
  buildProductServiceTypeMap,
  filterOrdersForServiceProvider as filterOrdersByServiceProvider,
  resolveOrderServiceType as resolveOrderServiceTypeSync,
} from "../lib/order-service-type.js";
import { assertHandlerMatchesServiceType, isServiceProviderRole } from "../lib/service-provider-role.js";
import { toAdminOrderRow, toHallOrderRow } from "../lib/mappers.js";
import type { Handler, Order } from "../types.js";

function isUnassigned(order: Order) {
  return !isAssignedServicePlayer(order.servicePlayer);
}

/** 待接单大厅 / 派单池：未指定打手且状态为 pending_accept */
function isAvailableForGrab(order: Order) {
  return (
    order.status === "pending_accept" &&
    isUnassigned(order) &&
    order.assignedPlayer === AUTO_ASSIGN_LABEL
  );
}

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

    const order = buildOrder({ ...input, serviceType: product.serviceType }, pricing);
    let nextOrder = order;
    if (input.assignedPlayer && input.assignedPlayer !== AUTO_ASSIGN_LABEL) {
      const handler = await this.resolveDesignatedHandler(input.assignedPlayer, product.serviceType);
      nextOrder = { ...order, servicePlayer: handler.name };
    }
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
    const created = await createOrder(nextOrder);
    if (pricing.userCouponId) {
      await markUserCouponUsed(pricing.userCouponId, created.id);
    }
    if (created.ownerUserId) {
      await chatDomainService.ensureServiceConversation(created.ownerUserId);
      await chatDomainService.syncOrderAssignment(created);
      await tryGrantInviteRewardsOnOrder(created);
    }
    return created;
  },

  async update(
    id: string,
    patch: Partial<Pick<Order, "status" | "servicePlayer" | "statusText" | "ownerUserId" | "serviceType">>,
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
    return orders.map((order) => ({
      ...toAdminOrderRow(order),
      serviceType: order.serviceType,
    }));
  },

  listHallRows(orders: Order[]) {
    return orders.map((order) => ({
      ...toHallOrderRow(order),
      serviceType: order.serviceType,
    }));
  },

  isUnassigned,

  isHallEligible: isAvailableForGrab,
  isDispatchEligible: isAvailableForGrab,

  async resolveOrderServiceType(order: Order) {
    if (order.serviceType) return order.serviceType;
    const product = await getProduct(order.productId);
    return resolveOrderServiceTypeSync(order, product ? new Map([[product.id, product.serviceType]]) : undefined);
  },

  async filterOrdersForServiceProvider(orders: Order[], handler: Handler) {
    const productMap = buildProductServiceTypeMap(await listProducts());
    return filterOrdersByServiceProvider(orders, handler, productMap);
  },

  async resolveDesignatedHandler(assignedPlayer: string, requiredServiceType: Handler["serviceType"]) {
    const handler = await resolveHandlerByName(assignedPlayer);
    if (!handler) throw new Error("HANDLER_NOT_FOUND");
    assertHandlerMatchesServiceType(handler, requiredServiceType);
    await assertClubParticipating(handler.clubId);
    return handler;
  },

  async resolveHandlerForAdmin(adminId: string) {
    if (!adminId || adminId === "env_admin") return null;
    const user = await getAdminUser(adminId);
    if (!user?.handlerId) return null;
    return getHandler(user.handlerId);
  },

  async listMineOrdersForHandler(handler: Handler) {
    const orders = await listOrders();
    return orders.filter((order) => order.servicePlayer === handler.name);
  },

  async listMinePendingWatchForHandler(handler: Handler) {
    const orders = await listOrders();
    return orders.filter(
      (order) => order.servicePlayer === handler.name && order.status === "pending_accept",
    );
  },

  async listHallOrdersForAdmin(adminId: string) {
    const orders = await this.listGrabPoolOrders();
    const user = adminId && adminId !== "env_admin" ? await getAdminUser(adminId) : null;
    const handler = await this.resolveHandlerForAdmin(adminId);

    // 服务者角色未绑定档案时不展示大厅（避免看到不可接的单）
    if (user?.roles.some(isServiceProviderRole) && !handler) {
      return [];
    }
    if (!handler) return orders;
    return this.filterOrdersForServiceProvider(orders, handler);
  },

  async listGrabPoolOrders() {
    const orders = await listOrders();
    return orders.filter((order) => isAvailableForGrab(order));
  },

  async listHallOrders() {
    return this.listGrabPoolOrders();
  },

  async listDispatchOrders() {
    return this.listGrabPoolOrders();
  },

  async acceptOrder(id: string, adminId: string) {
    const handler = await this.resolveHandlerForAdmin(adminId);
    if (!handler) throw new Error("HANDLER_NOT_FOUND");

    const order = await getOrder(id);
    if (!order) return null;
    if (!isAvailableForGrab(order)) {
      throw new Error("ORDER_NOT_AVAILABLE");
    }

    const serviceType = await this.resolveOrderServiceType(order);
    assertHandlerMatchesServiceType(handler, serviceType, "ORDER_SERVICE_TYPE_MISMATCH");

    return this.update(id, { servicePlayer: handler.name });
  },

  async assignOrder(
    id: string,
    input: { playerName?: string; handlerId?: string },
  ) {
    const order = await getOrder(id);
    if (!order) return null;
    if (!isAvailableForGrab(order)) {
      throw new Error("ORDER_NOT_AVAILABLE");
    }

    let playerName = input.playerName?.trim() ?? "";

    if (input.handlerId) {
      const handler = await getHandler(input.handlerId);
      if (!handler) throw new Error("HANDLER_NOT_FOUND");
      await assertClubParticipating(handler.clubId);
      const serviceType = await this.resolveOrderServiceType(order);
      assertHandlerMatchesServiceType(handler, serviceType);
      playerName = handler.name;
    }

    if (!playerName) throw new Error("INVALID_PLAYER");

    const handler = findHandlerByName(await listHandlers(), playerName);
    if (handler) {
      await assertClubParticipating(handler.clubId);
    }

    return this.update(id, { servicePlayer: playerName });
  },
};

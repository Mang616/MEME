import type { Handler, Order, Product, ServiceType } from "../types.js";

export type ProductServiceTypeMap = Map<string, ServiceType>;

const DEFAULT_SERVICE_TYPE: ServiceType = "escort";

export function buildProductServiceTypeMap(products: Product[]): ProductServiceTypeMap {
  return new Map(products.map((product) => [product.id, product.serviceType]));
}

/** 同步解析订单服务类型（优先订单字段，其次商品映射） */
export function resolveOrderServiceType(
  order: Order,
  productMap?: ProductServiceTypeMap,
): ServiceType {
  if (order.serviceType) return order.serviceType;
  return productMap?.get(order.productId) ?? DEFAULT_SERVICE_TYPE;
}

export function handlerMatchesOrderServiceType(handler: Handler, orderServiceType: ServiceType) {
  return handler.serviceType === orderServiceType;
}

export function filterOrdersForServiceProvider(
  orders: Order[],
  handler: Handler,
  productMap: ProductServiceTypeMap,
) {
  return orders.filter((order) =>
    handlerMatchesOrderServiceType(handler, resolveOrderServiceType(order, productMap)),
  );
}

/** @deprecated 使用 filterOrdersForServiceProvider */
export const filterOrdersForHandler = filterOrdersForServiceProvider;

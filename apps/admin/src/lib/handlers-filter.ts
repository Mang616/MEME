import type { HandlerRow } from "./api";

export function filterHandlersByServiceType(
  handlers: HandlerRow[],
  serviceType: HandlerRow["serviceType"] | null | undefined,
) {
  if (!serviceType) return handlers;
  return handlers.filter((row) => row.serviceType === serviceType);
}

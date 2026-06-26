import { AUTO_ASSIGN_LABEL } from "../constants.js";
import { listHandlers } from "../db/index.js";
import type { Handler } from "../types.js";

const UNASSIGNED_SERVICE_PLAYER = new Set(["", "—", AUTO_ASSIGN_LABEL]);

/** 订单是否已指派服务者（以档案昵称为准） */
export function isAssignedServicePlayer(name?: string | null): boolean {
  const trimmed = name?.trim() ?? "";
  return Boolean(trimmed && !UNASSIGNED_SERVICE_PLAYER.has(trimmed));
}

export function findHandlerByName(handlers: Handler[], name: string): Handler | undefined {
  const trimmed = name.trim();
  if (!isAssignedServicePlayer(trimmed)) return undefined;
  return handlers.find((item) => item.name === trimmed);
}

export async function resolveHandlerByName(name: string): Promise<Handler | null> {
  if (!isAssignedServicePlayer(name)) return null;
  return findHandlerByName(await listHandlers(), name) ?? null;
}

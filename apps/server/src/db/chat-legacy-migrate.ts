import { USE_MYSQL } from "../config.js";
import { AUTO_ASSIGN_LABEL } from "../constants.js";
import {
  playerConversationId,
  serviceConversationId,
} from "../lib/chat-conversation-id.js";
import { findHandlerByName } from "../lib/handler-resolve.js";
import { serviceProviderRoleLabel } from "../lib/service-provider-role.js";
import type { ChatConversation, ChatMessage, Database, Handler, Order } from "../types.js";

function resolveOwnerFromOrder(order: Order, users: Database["users"]) {
  if (order.ownerUserId?.trim()) return order.ownerUserId.trim();
  const nickname = order.userId?.trim();
  if (!nickname) return "";
  return users.find((user) => user.nickname === nickname || user.id === nickname)?.id ?? "";
}

function resolveHandlerFromOrder(order: Order, handlers: Handler[]) {
  return findHandlerByName(handlers, order.servicePlayer ?? "") ?? null;
}

function shouldDropConversation(conv: ChatConversation) {
  if (conv.type !== "player") return false;
  const name = conv.name?.trim();
  return !name || name === AUTO_ASSIGN_LABEL || name === "待分配" || name === "超级管理员";
}

function migrateChatDraft(draft: Database) {
  let changed = false;
  const orderMap = new Map(draft.orders.map((order) => [order.id, order]));
  const demoUserId = draft.users.find((user) => user.id === "u1")?.id ?? draft.users[0]?.id ?? "";
  const idRemap = new Map<string, string>();

  let conversations = [...draft.chatConversations];

  const legacyIdx = conversations.findIndex((conv) => conv.id === "chat_service");
  if (legacyIdx >= 0 && demoUserId) {
    const legacy = conversations[legacyIdx];
    const targetId = serviceConversationId(demoUserId);
    const targetIdx = conversations.findIndex((conv) => conv.id === targetId);
    if (targetIdx < 0) {
      conversations[legacyIdx] = { ...legacy, id: targetId, ownerUserId: demoUserId };
      idRemap.set("chat_service", targetId);
    } else {
      conversations.splice(legacyIdx, 1);
      idRemap.set("chat_service", targetId);
    }
    changed = true;
  }

  conversations = conversations.filter((conv) => {
    if (!shouldDropConversation(conv)) return true;
    changed = true;
    return false;
  });

  conversations = conversations.map((conv) => {
    let next: ChatConversation = { ...conv };
    const order = next.linkedOrderId ? orderMap.get(next.linkedOrderId) : undefined;

    if (!next.ownerUserId?.trim()) {
      if (next.type === "service" && demoUserId) {
        next.ownerUserId = demoUserId;
        changed = true;
      } else if (order) {
        const ownerUserId = resolveOwnerFromOrder(order, draft.users);
        if (ownerUserId) {
          next.ownerUserId = ownerUserId;
          changed = true;
        }
      }
    }

    if (next.type === "player" && order) {
      const handler = resolveHandlerFromOrder(order, draft.handlers);
      if (handler) {
        next = {
          ...next,
          handlerId: handler.id,
          name: handler.name,
          roleLabel: serviceProviderRoleLabel(handler.serviceType),
          escortLevel: handler.level,
          online: handler.online,
        };
        changed = true;
      }
      const expectedId = playerConversationId(order.id);
      if (next.id !== expectedId && !conversations.some((row) => row.id === expectedId)) {
        idRemap.set(next.id, expectedId);
        next = { ...next, id: expectedId };
        changed = true;
      }
    }

    return next;
  });

  const serviceByOwner = new Map<string, ChatConversation>();
  const dropIds = new Set<string>();
  for (const conv of conversations) {
    if (conv.type !== "service" || !conv.ownerUserId) continue;
    const existing = serviceByOwner.get(conv.ownerUserId);
    if (!existing) {
      serviceByOwner.set(conv.ownerUserId, conv);
      continue;
    }
    const keep =
      (conv.lastTime || "").localeCompare(existing.lastTime || "") >= 0 ? conv : existing;
    const drop = keep.id === conv.id ? existing : conv;
    dropIds.add(drop.id);
    serviceByOwner.set(conv.ownerUserId, keep);
    changed = true;
  }
  if (dropIds.size) {
    conversations = conversations.filter((conv) => !dropIds.has(conv.id));
  }

  const remapId = (conversationId: string) => {
    let current = conversationId;
    const seen = new Set<string>();
    while (idRemap.has(current) && !seen.has(current)) {
      seen.add(current);
      current = idRemap.get(current)!;
    }
    return current;
  };

  const messages: ChatMessage[] = draft.chatMessages
    .filter((msg) => !dropIds.has(msg.conversationId))
    .map((msg) => {
      const nextId = remapId(msg.conversationId);
      if (nextId !== msg.conversationId) {
        changed = true;
        return { ...msg, conversationId: nextId };
      }
      return msg;
    });

  draft.chatConversations = conversations;
  draft.chatMessages = messages;

  // 已完成订单的打手会话标记为已终止（保留消息）
  for (const conv of draft.chatConversations) {
    if (conv.type !== "player" || conv.closedAt || !conv.linkedOrderId) continue;
    const order = orderMap.get(conv.linkedOrderId);
    if (order?.status === "completed") {
      conv.closedAt = conv.closedAt || "2026-01-01 00:00:00";
      conv.online = false;
      changed = true;
    }
  }

  return changed;
}

/** 回填 ownerUserId / handlerId，合并旧版客服会话，清理无效打手会话 */
export async function migrateChatConversations() {
  if (USE_MYSQL) {
    const mysqlStore = await import("./mysql-store.js");
    const { listOrders, listHandlers, listUsers, listChatConversations } = await import("./index.js");
    const convs = await listChatConversations();
    const messages: ChatMessage[] = [];
    for (const conv of convs) {
      messages.push(...(await mysqlStore.listChatMessages(conv.id)));
    }
    const draft = {
      orders: await listOrders(),
      handlers: await listHandlers(),
      users: await listUsers(),
      chatConversations: convs,
      chatMessages: messages,
    } as Database;

    if (!migrateChatDraft(draft)) return false;
    await mysqlStore.replaceChatData(draft.chatConversations, draft.chatMessages);
    console.log("[meme-server] Chat conversations migrated (MySQL)");
    return true;
  }

  const jsonStore = await import("./json-store.js");
  let changed = false;
  await jsonStore.updateDb((draft) => {
    if (migrateChatDraft(draft)) changed = true;
  });
  if (changed) {
    console.log("[meme-server] Chat conversations migrated (JSON)");
  }
  return changed;
}

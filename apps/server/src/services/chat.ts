import type { AdminRole } from "../constants/admin-rbac.js";
import { canAccessChatType } from "../constants/admin-rbac.js";
import {
  getChatConversation,
  getChatConversationByOrderId,
  getHandler,
  getOrder,
  insertChatConversation,
  insertChatMessage,
  listChatConversations,
  listHandlers,
  updateChatConversation,
} from "../db/index.js";
import { formatDateTime } from "../lib/format-time.js";
import type { ChatConversation, ChatMessage, Handler, Order } from "../types.js";

const CHAT_TYPE = {
  SERVICE: "service",
  PLAYER: "player",
} as const;

const SERVICE_META = {
  name: "迷因官方客服",
  roleLabel: "平台客服",
  avatarText: "客",
  avatarColor: "#3d5240",
};

function serviceConversationId(ownerUserId: string) {
  return `chat_svc_${ownerUserId}`;
}

function playerConversationId(orderId: string) {
  return `chat_ord_${orderId}`;
}

function formatChatTime(date = new Date()) {
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const hm = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  if (isToday) return hm;
  return `${date.getMonth() + 1}-${date.getDate()} ${hm}`;
}

function buildMessageId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toClientMessage(message: ChatMessage, viewer: "user" | "staff") {
  const fromSelf =
    viewer === "user" ? message.senderType === "user" : message.senderType === "staff";
  return {
    id: message.id,
    from: fromSelf ? ("self" as const) : ("other" as const),
    type: message.type,
    content: message.content,
    time: message.time,
    senderType: message.senderType,
    senderId: message.senderId,
  };
}

function canUserAccessConversation(conv: ChatConversation, ownerUserId: string) {
  return conv.ownerUserId === ownerUserId;
}

async function resolveHandlerByName(name: string): Promise<Handler | null> {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "—") return null;
  const handlers = await listHandlers();
  return handlers.find((item) => item.name === trimmed) ?? null;
}

function handlerDisplayMeta(handler: Handler | null, fallbackName: string) {
  if (!handler) {
    return {
      name: fallbackName,
      roleLabel: "服务打手",
      escortLevel: undefined,
      avatarText: fallbackName.charAt(0) || "手",
      avatarColor: "#4a5f52",
      handlerId: "",
      online: false,
    };
  }
  return {
    name: handler.name,
    roleLabel: "服务打手",
    escortLevel: handler.level,
    avatarText: handler.name.charAt(0) || "手",
    avatarColor: "#4a5f52",
    handlerId: handler.id,
    online: handler.online,
  };
}

async function appendMessage(input: {
  conversationId: string;
  senderType: NonNullable<ChatMessage["senderType"]>;
  senderId: string;
  content: string;
  type?: string;
  increaseUnreadForUser?: boolean;
  increaseUnreadForStaff?: boolean;
}) {
  const conv = await getChatConversation(input.conversationId);
  if (!conv) throw new Error("CHAT_NOT_FOUND");

  const message: ChatMessage = {
    id: buildMessageId("msg"),
    conversationId: input.conversationId,
    from: input.senderType === "user" ? "self" : "other",
    type: input.type ?? "text",
    content: input.content,
    time: formatChatTime(),
    senderType: input.senderType,
    senderId: input.senderId,
  };

  await insertChatMessage(message);
  await updateChatConversation(input.conversationId, {
    lastMessage: input.content,
    lastTime: message.time,
    unread: input.increaseUnreadForUser ? conv.unread + 1 : conv.unread,
    staffUnread: input.increaseUnreadForStaff ? (conv.staffUnread ?? 0) + 1 : conv.staffUnread ?? 0,
  });

  return message;
}

export const chatDomainService = {
  serviceConversationId,
  playerConversationId,

  async ensureServiceConversation(ownerUserId: string) {
    const id = serviceConversationId(ownerUserId);
    let conv = await getChatConversation(id);
    if (conv) return conv;

    conv = {
      id,
      type: CHAT_TYPE.SERVICE,
      ...SERVICE_META,
      ownerUserId,
      lastMessage: "",
      lastTime: "",
      unread: 0,
      staffUnread: 0,
      online: true,
      sortOrder: 0,
    };
    await insertChatConversation(conv);
    await appendMessage({
      conversationId: id,
      senderType: "system",
      senderId: "system",
      content: "您好，我是迷因电竞客服，有什么可以帮您？",
      increaseUnreadForUser: true,
    });
    return (await getChatConversation(id))!;
  },

  async ensurePlayerConversationForOrder(order: Order) {
    const id = playerConversationId(order.id);
    let conv = await getChatConversation(id);
    const handlerName =
      order.servicePlayer !== "—" ? order.servicePlayer : order.assignedPlayer;
    const handler = await resolveHandlerByName(handlerName);
    const meta = handlerDisplayMeta(handler, handlerName);

    if (!conv) {
      conv = {
        id,
        type: CHAT_TYPE.PLAYER,
        name: meta.name,
        roleLabel: meta.roleLabel,
        escortLevel: meta.escortLevel,
        avatarText: meta.avatarText,
        avatarColor: meta.avatarColor,
        linkedOrderId: order.id,
        ownerUserId: order.ownerUserId ?? "",
        handlerId: meta.handlerId,
        customerGameId: order.userId,
        lastMessage: "",
        lastTime: "",
        unread: 0,
        staffUnread: 0,
        online: meta.online,
        sortOrder: 1,
      };
      await insertChatConversation(conv);
      await appendMessage({
        conversationId: id,
        senderType: "system",
        senderId: meta.handlerId || "system",
        content: `老板好，我是您订单 ${order.id} 的服务打手，有任何问题可以随时沟通。`,
        increaseUnreadForUser: true,
      });
      return (await getChatConversation(id))!;
    }

    const patch: Partial<ChatConversation> = {};
    if (meta.handlerId && conv.handlerId !== meta.handlerId) {
      patch.handlerId = meta.handlerId;
      patch.name = meta.name;
      patch.escortLevel = meta.escortLevel;
      patch.online = meta.online;
    }
    if (order.ownerUserId && conv.ownerUserId !== order.ownerUserId) {
      patch.ownerUserId = order.ownerUserId;
    }
    if (Object.keys(patch).length > 0) {
      await updateChatConversation(id, patch);
      conv = { ...conv, ...patch };
    }
    return conv;
  },

  async listForUser(ownerUserId: string) {
    await this.ensureServiceConversation(ownerUserId);
    const items = await listChatConversations();
    return items
      .filter((conv) => conv.ownerUserId === ownerUserId)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },

  async listForAdmin(roles: AdminRole[]) {
    const items = await listChatConversations();
    return items
      .filter((conv) => canAccessChatType(roles, conv.type))
      .filter((conv) => conv.type !== "service" || conv.ownerUserId)
      .sort((a, b) => {
        const staffDiff = (b.staffUnread ?? 0) - (a.staffUnread ?? 0);
        if (staffDiff !== 0) return staffDiff;
        return (b.lastTime || "").localeCompare(a.lastTime || "");
      });
  },

  async getConversationForUser(conversationId: string, ownerUserId: string) {
    const conv = await getChatConversation(conversationId);
    if (!conv || !canUserAccessConversation(conv, ownerUserId)) return null;
    return conv;
  },

  async getConversationForAdmin(conversationId: string, roles: AdminRole[]) {
    const conv = await getChatConversation(conversationId);
    if (!conv || !canAccessChatType(roles, conv.type)) return null;
    return conv;
  },

  async getMessagesForUser(conversationId: string, ownerUserId: string) {
    const conv = await this.getConversationForUser(conversationId, ownerUserId);
    if (!conv) return null;
    const { listChatMessages } = await import("../db/index.js");
    const messages = await listChatMessages(conversationId);
    return {
      conversation: conv,
      items: messages.map((message) => toClientMessage(message, "user")),
    };
  },

  async getMessagesForAdmin(conversationId: string, roles: AdminRole[]) {
    const conv = await this.getConversationForAdmin(conversationId, roles);
    if (!conv) return null;
    const { listChatMessages } = await import("../db/index.js");
    const messages = await listChatMessages(conversationId);
    const conversation = (await this.markReadForStaff(conversationId, roles, conv)) ?? conv;
    return {
      conversation,
      items: messages.map((message) => toClientMessage(message, "staff")),
    };
  },

  async sendUserMessage(conversationId: string, ownerUserId: string, content: string) {
    const conv = await this.getConversationForUser(conversationId, ownerUserId);
    if (!conv) throw new Error("CHAT_NOT_FOUND");
    const text = content.trim();
    if (!text) throw new Error("EMPTY_MESSAGE");
    return appendMessage({
      conversationId,
      senderType: "user",
      senderId: ownerUserId,
      content: text,
      increaseUnreadForStaff: true,
    });
  },

  async sendStaffMessage(conversationId: string, adminId: string, content: string, roles: AdminRole[]) {
    const conv = await this.getConversationForAdmin(conversationId, roles);
    if (!conv) throw new Error("CHAT_NOT_FOUND");
    const text = content.trim();
    if (!text) throw new Error("EMPTY_MESSAGE");
    return appendMessage({
      conversationId,
      senderType: "staff",
      senderId: adminId,
      content: text,
      increaseUnreadForUser: true,
    });
  },

  async markReadForUser(conversationId: string, ownerUserId: string) {
    const conv = await this.getConversationForUser(conversationId, ownerUserId);
    if (!conv) return null;
    if (!conv.unread) return conv;
    return updateChatConversation(conversationId, { unread: 0 });
  },

  async markReadForStaff(
    conversationId: string,
    roles: AdminRole[],
    existing?: ChatConversation | null,
  ) {
    const conv =
      existing !== undefined
        ? existing && canAccessChatType(roles, existing.type)
          ? existing
          : null
        : await this.getConversationForAdmin(conversationId, roles);
    if (!conv) return null;
    if (!(conv.staffUnread ?? 0)) return conv;
    return updateChatConversation(conversationId, { staffUnread: 0 });
  },

  async getOrCreateByOrder(orderId: string, ownerUserId: string) {
    const order = await getOrder(orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.ownerUserId && order.ownerUserId !== ownerUserId) {
      throw new Error("ORDER_FORBIDDEN");
    }
    if (!order.ownerUserId) {
      const { updateOrder } = await import("../db/index.js");
      await updateOrder(orderId, { ownerUserId });
      order.ownerUserId = ownerUserId;
    }
    return this.ensurePlayerConversationForOrder(order);
  },

  async findByOrderId(orderId: string) {
    return getChatConversationByOrderId(orderId);
  },

  async syncOrderAssignment(order: Order) {
    const playerName = order.servicePlayer !== "—" ? order.servicePlayer : "";
    if (!playerName) return null;
    if (!order.ownerUserId) return null;
    return this.ensurePlayerConversationForOrder(order);
  },
};

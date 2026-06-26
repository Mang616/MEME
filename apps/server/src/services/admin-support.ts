import type { AdminRole } from "../constants/admin-rbac.js";
import { getUser } from "../db/index.js";
import { formatUserDisplayName } from "../lib/user-display.js";
import { chatDomainService } from "./chat.js";
import type { AppUser, ChatConversation } from "../types.js";

const CHAT_TYPE_LABELS: Record<string, string> = {
  service: "客服会话",
  player: "打手会话",
};

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  feature: "功能建议",
  order: "订单问题",
  account: "账号安全",
  other: "其他",
};

export type AdminChatRow = {
  id: string;
  type: string;
  typeLabel: string;
  /** 后台视角：会话对象（用户）展示名 */
  name: string;
  ownerUserId: string;
  ownerNickname: string;
  ownerPhone: string;
  handlerName: string;
  lastMessage: string;
  lastTime: string;
  /** 员工侧未读，源自 conversation.staffUnread */
  unread: number;
  online: boolean;
  linkedOrderId: string;
  /** 打手/陪玩会话终止时间（空=进行中） */
  closedAt?: string;
};

export type AdminChatMessageRow = {
  id: string;
  from: "self" | "other";
  fromLabel: string;
  content: string;
  time: string;
  senderType?: string;
};

export type AdminFeedbackRow = {
  id: string;
  userId: string;
  userNickname: string;
  typeId: string;
  typeLabel: string;
  content: string;
  contact: string;
  createdAt: string;
};

async function loadOwnerMap(conversations: ChatConversation[]) {
  const ownerIds = [
    ...new Set(conversations.map((conv) => conv.ownerUserId).filter(Boolean)),
  ] as string[];
  const users = await Promise.all(ownerIds.map((id) => getUser(id)));
  return new Map(
    users.filter((user): user is AppUser => !!user).map((user) => [user.id, user]),
  );
}

function toAdminChatRow(conversation: ChatConversation, user?: AppUser): AdminChatRow {
  const ownerUserId = conversation.ownerUserId ?? "";
  const isPlayer = conversation.type === "player";

  return {
    id: conversation.id,
    type: conversation.type,
    typeLabel: CHAT_TYPE_LABELS[conversation.type] ?? conversation.type,
    name: formatUserDisplayName(user, ownerUserId),
    ownerUserId,
    ownerNickname: user?.nickname?.trim() ?? "",
    ownerPhone: user?.phone ?? "",
    handlerName: isPlayer ? conversation.name : "",
    lastMessage: conversation.lastMessage,
    lastTime: conversation.lastTime,
    unread: conversation.staffUnread ?? 0,
    online: conversation.online,
    linkedOrderId: conversation.linkedOrderId ?? "",
    closedAt: conversation.closedAt,
  };
}

function messageFromLabel(
  message: { from: "self" | "other"; senderType?: string },
  adminDisplayName: string,
  userDisplayName: string,
) {
  if (message.from === "self") return adminDisplayName || "客服";
  if (message.senderType === "system") return "系统";
  return userDisplayName || "用户";
}

function toAdminMessageRow(
  message: {
    id: string;
    from: "self" | "other";
    content: string;
    time: string;
    senderType?: string;
  },
  adminDisplayName: string,
  userDisplayName: string,
): AdminChatMessageRow {
  return {
    id: message.id,
    from: message.from,
    fromLabel: messageFromLabel(message, adminDisplayName, userDisplayName),
    content: message.content,
    time: message.time,
    senderType: message.senderType,
  };
}

export const adminSupportService = {
  async listChatRows(roles: AdminRole[], linkedHandlerId?: string) {
    const items = await chatDomainService.listForAdmin(roles, linkedHandlerId);
    const ownerMap = await loadOwnerMap(items);
    return items.map((conv) => toAdminChatRow(conv, ownerMap.get(conv.ownerUserId ?? "")));
  },

  async getChatMessages(
    conversationId: string,
    roles: AdminRole[],
    adminDisplayName: string,
    linkedHandlerId?: string,
  ) {
    const detail = await chatDomainService.getMessagesForAdmin(
      conversationId,
      roles,
      linkedHandlerId,
    );
    if (!detail) return null;

    const user = detail.conversation.ownerUserId
      ? await getUser(detail.conversation.ownerUserId)
      : undefined;
    const row = toAdminChatRow(detail.conversation, user ?? undefined);

    return {
      conversation: row,
      messages: detail.items.map((message) =>
        toAdminMessageRow(message, adminDisplayName, row.name),
      ),
    };
  },

  async replyChat(
    conversationId: string,
    roles: AdminRole[],
    adminId: string,
    content: string,
    adminDisplayName: string,
    linkedHandlerId?: string,
  ) {
    const message = await chatDomainService.sendStaffMessage(
      conversationId,
      adminId,
      content,
      roles,
      linkedHandlerId,
    );
    return toAdminMessageRow(
      { ...message, from: "self" },
      adminDisplayName,
      "",
    );
  },

  async closeChat(conversationId: string, roles: AdminRole[], linkedHandlerId?: string) {
    const conv = await chatDomainService.getConversationForAdmin(
      conversationId,
      roles,
      linkedHandlerId,
    );
    if (!conv) throw new Error("CHAT_NOT_FOUND");
    if (conv.type === "service") throw new Error("CHAT_CLOSE_NOT_ALLOWED");
    const closed = await chatDomainService.closePlayerConversation(conversationId, "会话已终止");
    if (!closed) throw new Error("CHAT_NOT_FOUND");
    const user = closed.ownerUserId ? await getUser(closed.ownerUserId) : undefined;
    return toAdminChatRow(closed, user ?? undefined);
  },

  async listFeedbackRows() {
    const { listFeedbacks } = await import("../db/index.js");
    const items = await listFeedbacks();
    const rows = await Promise.all(
      items.map(async (feedback) => {
        const user = await getUser(feedback.userId);
        return {
          id: feedback.id,
          userId: feedback.userId,
          userNickname: formatUserDisplayName(user ?? undefined, feedback.userId),
          typeId: feedback.typeId,
          typeLabel: FEEDBACK_TYPE_LABELS[feedback.typeId] ?? feedback.typeId,
          content: feedback.content,
          contact: feedback.contact,
          createdAt: feedback.createdAt,
        } satisfies AdminFeedbackRow;
      }),
    );
    return rows;
  },
};

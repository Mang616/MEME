import * as jsonStore from "./json-store.js";
import type { ChatConversation, ChatMessage } from "../types.js";

export async function jsonInsertChatConversation(conv: ChatConversation) {
  await jsonStore.updateDb((db) => {
    if (db.chatConversations.some((row) => row.id === conv.id)) {
      throw new Error("CHAT_EXISTS");
    }
    db.chatConversations.push(conv);
  });
  return conv;
}

export async function jsonUpdateChatConversation(id: string, patch: Partial<ChatConversation>) {
  let updated: ChatConversation | null = null;
  await jsonStore.updateDb((db) => {
    const index = db.chatConversations.findIndex((row) => row.id === id);
    if (index < 0) return;
    const next = { ...db.chatConversations[index], ...patch, id };
    db.chatConversations[index] = next;
    updated = next;
  });
  return updated;
}

export async function jsonInsertChatMessage(message: ChatMessage) {
  await jsonStore.updateDb((db) => {
    db.chatMessages.push(message);
  });
  return message;
}

export async function jsonListChatConversationsByOwner(ownerUserId: string) {
  const db = await jsonStore.readDb();
  return db.chatConversations.filter((conv) => conv.ownerUserId === ownerUserId);
}

export async function jsonGetChatConversationByOrder(orderId: string) {
  const db = await jsonStore.readDb();
  return db.chatConversations.find((conv) => conv.linkedOrderId === orderId) ?? null;
}

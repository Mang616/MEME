import { Message } from "@arco-design/web-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminLivePoll } from "@/contexts/AdminLivePollContext";
import { sumChatUnread } from "@/lib/chat-utils";
import { api, type ChatMessageRow, type ChatRow } from "@/lib/api";
import { hasPermission } from "@/lib/session";

const CHAT_POLL_MS = 5_000;

function matchChatRow(row: ChatRow, keyword: string) {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return [
    row.name,
    row.ownerNickname,
    row.ownerPhone,
    row.ownerUserId,
    row.handlerName,
    row.lastMessage,
    row.linkedOrderId,
    row.typeLabel,
  ]
    .filter(Boolean)
    .some((part) => String(part).toLowerCase().includes(q));
}

export function useChatWorkspace() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatRow | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollingRef = useRef(false);
  const canReply = hasPermission("chats.reply");
  const { refresh: refreshNavIndicators, reportChatUnread } = useAdminLivePoll();

  const syncRows = useCallback(
    (items: ChatRow[]) => {
      setRows(items);
      reportChatUnread(sumChatUnread(items));
    },
    [reportChatUnread],
  );

  const loadList = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const data = await api.listChats();
        syncRows(data.items);
        return data.items;
      } catch {
        if (!silent) Message.error("加载会话失败");
        return [];
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [syncRows],
  );

  const loadMessages = useCallback(
    async (row: ChatRow, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      setActiveChat(row);
      if (!silent) {
        setDetailLoading(true);
        setDraft("");
      }

      try {
        const detail = await api.getChatMessages(row.id);
        setActiveChat(detail.conversation);
        setMessages(detail.messages);
        setRows((prev) => {
          const next = prev.map((item) =>
            item.id === row.id ? { ...detail.conversation, unread: 0 } : item,
          );
          reportChatUnread(sumChatUnread(next));
          return next;
        });
        refreshNavIndicators();
      } catch {
        if (!silent) {
          Message.error("加载消息失败");
          setMessages([]);
        }
      } finally {
        if (!silent) setDetailLoading(false);
      }
    },
    [refreshNavIndicators, reportChatUnread],
  );

  const reloadActiveConversation = useCallback(
    async (items: ChatRow[], silent = false) => {
      const activeId = activeChat?.id;
      if (!activeId) return;

      const hit = items.find((item) => item.id === activeId);
      if (hit) {
        await loadMessages(hit, { silent });
        return;
      }

      if (!silent) {
        setActiveChat(null);
        setMessages([]);
      }
    },
    [activeChat?.id, loadMessages],
  );

  const poll = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    try {
      const items = await loadList(true);
      await reloadActiveConversation(items, true);
    } finally {
      pollingRef.current = false;
    }
  }, [loadList, reloadActiveConversation]);

  useEffect(() => {
    void loadList().then((items) => {
      if (items[0]) void loadMessages(items[0]);
    });
  }, [loadList, loadMessages]);

  useEffect(() => {
    const timer = window.setInterval(() => void poll(), CHAT_POLL_MS);
    return () => window.clearInterval(timer);
  }, [poll]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, detailLoading]);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchChatRow(row, keyword)),
    [rows, keyword],
  );

  const unreadTotal = useMemo(() => sumChatUnread(rows), [rows]);

  const refresh = useCallback(async () => {
    const items = await loadList();
    if (activeChat?.id) {
      const hit = items.find((item) => item.id === activeChat.id);
      if (hit) {
        void loadMessages(hit);
        return;
      }
    }
    if (items[0]) {
      void loadMessages(items[0]);
      return;
    }
    setActiveChat(null);
    setMessages([]);
  }, [activeChat?.id, loadList, loadMessages]);

  const handleReply = useCallback(async () => {
    if (!activeChat || !draft.trim() || !canReply) return;
    setReplying(true);
    try {
      const message = await api.replyChat(activeChat.id, draft.trim());
      setMessages((prev) => [...prev, message]);
      setDraft("");
      setRows((prev) => {
        const next = prev.map((row) =>
          row.id === activeChat.id
            ? { ...row, lastMessage: message.content, lastTime: message.time, unread: 0 }
            : row,
        );
        reportChatUnread(sumChatUnread(next));
        return next;
      });
    } catch {
      Message.error("发送失败");
    } finally {
      setReplying(false);
    }
  }, [activeChat, canReply, draft, reportChatUnread]);

  return {
    loading,
    rows,
    keyword,
    setKeyword,
    filteredRows,
    unreadTotal,
    activeChat,
    messages,
    detailLoading,
    replying,
    draft,
    setDraft,
    canReply,
    messagesEndRef,
    loadMessages,
    refresh,
    handleReply,
  };
}

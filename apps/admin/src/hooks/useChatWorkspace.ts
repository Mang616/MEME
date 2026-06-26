import { Message } from "@arco-design/web-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ADMIN_CHAT_POLL_MS } from "@/constants/polling";
import { useAdminLivePoll } from "@/contexts/AdminLivePollContext";
import { usePollingGuard } from "@/hooks/usePollingGuard";
import {
  isChatTerminated,
  isPlayerChat,
  matchChatRow,
  sumChatUnread,
} from "@/lib/chat-utils";
import { api, ApiError, type ChatMessageRow, type ChatRow } from "@/lib/api";
import { hasPermission } from "@/lib/session";

export function useChatWorkspace() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [replying, setReplying] = useState(false);
  const [closing, setClosing] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatRow | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const runPoll = usePollingGuard();
  const canReply = hasPermission("chats.reply") && !isChatTerminated(activeChat ?? {});
  const { reportChatUnread } = useAdminLivePoll();

  const patchRows = useCallback(
    (updater: (prev: ChatRow[]) => ChatRow[]) => {
      setRows((prev) => {
        const next = updater(prev);
        reportChatUnread(sumChatUnread(next));
        return next;
      });
    },
    [reportChatUnread],
  );

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
        patchRows((prev) =>
          prev.map((item) =>
            item.id === row.id ? { ...detail.conversation, unread: 0 } : item,
          ),
        );
      } catch {
        if (!silent) {
          Message.error("加载消息失败");
          setMessages([]);
        }
      } finally {
        if (!silent) setDetailLoading(false);
      }
    },
    [patchRows],
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
    await runPoll(async () => {
      const items = await loadList(true);
      await reloadActiveConversation(items, true);
    });
  }, [loadList, reloadActiveConversation, runPoll]);

  useEffect(() => {
    void loadList().then((items) => {
      if (items[0]) void loadMessages(items[0]);
    });
  }, [loadList, loadMessages]);

  useEffect(() => {
    const timer = window.setInterval(() => void poll(), ADMIN_CHAT_POLL_MS);
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
    const activeId = activeChat?.id;
    const hit = activeId ? items.find((item) => item.id === activeId) : items[0];

    if (hit) {
      void loadMessages(hit);
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
      patchRows((prev) =>
        prev.map((row) =>
          row.id === activeChat.id
            ? { ...row, lastMessage: message.content, lastTime: message.time, unread: 0 }
            : row,
        ),
      );
    } catch (err) {
      const message =
        err instanceof ApiError && err.code === "CHAT_CLOSED"
          ? "会话已结束，无法发送消息"
          : "发送失败";
      Message.error(message);
    } finally {
      setReplying(false);
    }
  }, [activeChat, canReply, draft, patchRows]);

  const handleCloseChat = useCallback(async () => {
    if (!activeChat || isChatTerminated(activeChat) || !isPlayerChat(activeChat)) return;
    setClosing(true);
    try {
      const row = await api.closeChat(activeChat.id);
      setActiveChat(row);
      patchRows((prev) => prev.map((item) => (item.id === row.id ? row : item)));
      Message.success("会话已终止");
    } catch (err) {
      Message.error(err instanceof ApiError ? err.message : "终止会话失败");
    } finally {
      setClosing(false);
    }
  }, [activeChat, patchRows]);

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
    closing,
    messagesEndRef,
    loadMessages,
    refresh,
    handleReply,
    handleCloseChat,
  };
}

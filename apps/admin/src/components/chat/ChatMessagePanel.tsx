import { Button, Empty, Input, Spin, Tag, Typography } from "@arco-design/web-react";
import { IconSend } from "@arco-design/web-react/icon";
import { useState, type RefObject } from "react";
import { UserDetailDrawer } from "@/components/users/UserDetailDrawer";
import {
  buildChatHeaderMeta,
  chatDisplayName,
  isChatTerminated,
  isPlayerChat,
} from "@/lib/chat-utils";
import type { ChatMessageRow, ChatRow } from "@/lib/api";
import { ChatAvatar } from "./ChatAvatar";

type ChatMessagePanelProps = {
  chat: ChatRow | null;
  messages: ChatMessageRow[];
  detailLoading: boolean;
  replying: boolean;
  draft: string;
  canReply: boolean;
  onCloseChat?: () => void;
  closing?: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export function ChatMessagePanel({
  chat,
  messages,
  detailLoading,
  replying,
  draft,
  canReply,
  onCloseChat,
  closing = false,
  messagesEndRef,
  onDraftChange,
  onSend,
}: ChatMessagePanelProps) {
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  if (!chat) {
    return (
      <section className="chat-workspace__panel">
        <div className="chat-workspace__empty">
          <Empty description="请从左侧选择一个会话" />
        </div>
      </section>
    );
  }

  const headerMeta = buildChatHeaderMeta(chat);
  const displayName = chatDisplayName(chat);

  return (
    <>
      <section className="chat-workspace__panel">
        <header className="chat-workspace__header">
          <div className="chat-workspace__header-main">
            <ChatAvatar name={displayName} />
            <div className="chat-workspace__header-info">
              <Typography.Title heading={6} className="chat-workspace__title">
                {displayName}
              </Typography.Title>
              {headerMeta ? (
                <Typography.Text type="secondary" className="chat-workspace__subtitle">
                  {headerMeta}
                </Typography.Text>
              ) : null}
            </div>
          </div>
          <div className="chat-workspace__header-actions">
            {chat.ownerUserId ? (
              <Button size="small" type="text" onClick={() => setDetailUserId(chat.ownerUserId!)}>
                用户详情
              </Button>
            ) : null}
            {isPlayerChat(chat) && isChatTerminated(chat) ? (
              <Tag color="gray">已终止</Tag>
            ) : isPlayerChat(chat) && onCloseChat ? (
              <Button size="small" type="outline" loading={closing} onClick={onCloseChat}>
                终止会话
              </Button>
            ) : null}
          </div>
        </header>

        {chat.linkedOrderId ? (
          <div className="chat-workspace__order-bar">
            <span className="chat-workspace__order-label">关联订单</span>
            <Typography.Text copyable className="chat-workspace__order-id">
              {chat.linkedOrderId}
            </Typography.Text>
          </div>
        ) : null}

        <div className="chat-workspace__messages">
          <Spin loading={detailLoading} style={{ width: "100%", minHeight: 120 }}>
            {messages.length === 0 && !detailLoading ? (
              <Empty description="还没有消息，发送第一条回复吧" />
            ) : (
              <div className="chat-message-list">
                {messages.map((msg) => {
                  const isSelf = msg.from === "self";
                  return (
                    <div
                      key={msg.id}
                      className={`chat-message-row${isSelf ? " chat-message-row--self" : ""}`}
                    >
                      {!isSelf ? (
                        <ChatAvatar name={msg.fromLabel} size="sm" />
                      ) : null}
                      <div className="chat-message-row__content">
                        <div className="chat-message-row__meta">
                          <span className="chat-message-row__sender">{msg.fromLabel}</span>
                          <span className="chat-message-row__time">{msg.time}</span>
                        </div>
                        <div
                          className={`chat-bubble${isSelf ? " chat-bubble--self" : " chat-bubble--other"}`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </Spin>
        </div>

        <footer className="chat-workspace__composer">
          {canReply ? (
            <>
              <Input.TextArea
                value={draft}
                placeholder="输入回复，Enter 发送，Shift+Enter 换行"
                autoSize={{ minRows: 2, maxRows: 5 }}
                onChange={onDraftChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
              />
              <Button
                type="primary"
                icon={<IconSend />}
                loading={replying}
                disabled={!draft.trim()}
                className="chat-workspace__send"
                onClick={onSend}
              >
                发送
              </Button>
            </>
          ) : (
            <Typography.Text type="secondary">
              {chat.closedAt ? "会话已终止，仅可查看历史消息" : "当前角色无回复权限"}
            </Typography.Text>
          )}
        </footer>
      </section>

      <UserDetailDrawer
        userId={detailUserId}
        visible={Boolean(detailUserId)}
        onClose={() => setDetailUserId(null)}
      />
    </>
  );
}

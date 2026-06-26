import { Empty, Input, Tag, Typography } from "@arco-design/web-react";
import type { ChatRow } from "@/lib/api";
import { chatDisplayName, formatUnreadBadge, isChatTerminated } from "@/lib/chat-utils";
import { ChatAvatar } from "./ChatAvatar";

type ChatConversationListProps = {
  rows: ChatRow[];
  filteredRows: ChatRow[];
  activeId: string | null;
  keyword: string;
  unreadTotal: number;
  onKeywordChange: (value: string) => void;
  onSelect: (row: ChatRow) => void;
};

export function ChatConversationList({
  rows,
  filteredRows,
  activeId,
  keyword,
  unreadTotal,
  onKeywordChange,
  onSelect,
}: ChatConversationListProps) {
  return (
    <aside className="chat-workspace__sidebar">
      <div className="chat-workspace__sidebar-head">
        <Input
          allowClear
          placeholder="搜索用户 / 订单 / 消息"
          value={keyword}
          onChange={onKeywordChange}
        />
        <Typography.Text type="secondary" className="chat-workspace__count">
          共 {filteredRows.length} 个会话
          {unreadTotal > 0 ? ` · ${unreadTotal} 条未读` : ""}
        </Typography.Text>
      </div>

      <div className="chat-workspace__list">
        {filteredRows.length === 0 ? (
          <Empty
            description={rows.length === 0 ? "暂无会话" : "没有匹配的会话"}
            style={{ marginTop: 48 }}
          />
        ) : (
          filteredRows.map((row) => {
            const active = row.id === activeId;
            return (
              <button
                key={row.id}
                type="button"
                className={`chat-conv-item${active ? " chat-conv-item--active" : ""}`}
                onClick={() => onSelect(row)}
              >
                <ChatAvatar name={chatDisplayName(row)} />
                <div className="chat-conv-item__body">
                  <div className="chat-conv-item__top">
                    <span className="chat-conv-item__name">{chatDisplayName(row)}</span>
                    {isChatTerminated(row) ? (
                      <Tag size="small" color="gray" style={{ marginLeft: 6 }}>
                        已终止
                      </Tag>
                    ) : null}
                    <span className="chat-conv-item__time">{row.lastTime}</span>
                  </div>
                  <div className="chat-conv-item__bottom">
                    <span className="chat-conv-item__preview">
                      {row.lastMessage || "暂无消息"}
                    </span>
                    {row.unread > 0 ? (
                      <span className="chat-conv-item__badge">
                        {formatUnreadBadge(row.unread)}
                      </span>
                    ) : null}
                  </div>
                  {row.linkedOrderId ? (
                    <div className="chat-conv-item__meta">
                      <span className="chat-conv-item__order">订单 {row.linkedOrderId}</span>
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}

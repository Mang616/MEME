import { Button } from "@arco-design/web-react";
import { IconRefresh } from "@arco-design/web-react/icon";
import { ChatConversationList } from "@/components/chat/ChatConversationList";
import { ChatMessagePanel } from "@/components/chat/ChatMessagePanel";
import { PageShell } from "@/components/PageShell";
import { useChatWorkspace } from "@/hooks/useChatWorkspace";

export default function ServiceChatsPage() {
  const {
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
  } = useChatWorkspace();

  return (
    <PageShell
      bare
      title="会话管理"
      subtitle="全部用户对话，左侧选会话、右侧回复"
      loading={loading}
      action={
        <Button type="outline" icon={<IconRefresh />} onClick={() => void refresh()}>
          刷新
        </Button>
      }
    >
      <div className="chat-workspace">
        <ChatConversationList
          rows={rows}
          filteredRows={filteredRows}
          activeId={activeChat?.id ?? null}
          keyword={keyword}
          unreadTotal={unreadTotal}
          onKeywordChange={setKeyword}
          onSelect={(row) => void loadMessages(row)}
        />

        <ChatMessagePanel
          chat={activeChat}
          messages={messages}
          detailLoading={detailLoading}
          replying={replying}
          draft={draft}
          canReply={canReply}
          messagesEndRef={messagesEndRef}
          onDraftChange={setDraft}
          onSend={() => void handleReply()}
        />
      </div>
    </PageShell>
  );
}

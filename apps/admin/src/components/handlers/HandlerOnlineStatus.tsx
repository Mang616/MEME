type HandlerOnlineStatusProps = {
  online: boolean;
  compact?: boolean;
};

export function HandlerOnlineStatus({ online, compact = false }: HandlerOnlineStatusProps) {
  return (
    <span
      className={`handler-online-status ${online ? "handler-online-status--on" : "handler-online-status--off"}${compact ? " handler-online-status--compact" : ""}`}
    >
      <span className="handler-online-status__dot" aria-hidden />
      {online ? "在线" : "离线"}
    </span>
  );
}

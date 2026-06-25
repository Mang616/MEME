type ChatAvatarProps = {
  name: string;
  size?: "md" | "sm";
};

/** 后台会话：头像始终代表用户（会话对象） */
export function ChatAvatar({ name, size = "md" }: ChatAvatarProps) {
  const text = name.trim().charAt(0) || "用";

  return (
    <div className={`chat-avatar chat-avatar--user chat-avatar--${size}`} aria-hidden>
      <span className="chat-avatar__initial">{text}</span>
    </div>
  );
}

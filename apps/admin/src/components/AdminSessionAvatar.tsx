import { Avatar } from "@arco-design/web-react";
import { resolveSessionAvatar } from "@/constants/role-avatars";
import type { AdminSession } from "@/lib/session";
import { adminAvatarStyle, avatarInitial } from "@/theme/admin-ui";

type AdminSessionAvatarProps = {
  session: Pick<AdminSession, "roles" | "displayName" | "username">;
  size?: number;
  className?: string;
};

export function AdminSessionAvatar({ session, size = 32, className }: AdminSessionAvatarProps) {
  const src = resolveSessionAvatar(session.roles);
  const initial = avatarInitial(session.displayName, session.username);

  if (src) {
    return (
      <Avatar size={size} className={className ?? "admin-role-avatar"}>
        <img src={src} alt="" draggable={false} />
      </Avatar>
    );
  }

  return (
    <Avatar size={size} className={className} style={adminAvatarStyle}>
      {initial}
    </Avatar>
  );
}

import { Avatar } from "@arco-design/web-react";
import { ADMIN_ROLE_LABELS, type AdminRole } from "@/constants/admin-rbac";
import { ROLE_AVATARS } from "@/constants/role-avatars";

type AdminRoleAvatarProps = {
  role: AdminRole;
  size?: number;
  className?: string;
};

export function AdminRoleAvatar({ role, size = 32, className }: AdminRoleAvatarProps) {
  const label = ADMIN_ROLE_LABELS[role];
  return (
    <Avatar size={size} className={className ?? "admin-role-avatar"}>
      <img src={ROLE_AVATARS[role]} alt={label} draggable={false} />
    </Avatar>
  );
}

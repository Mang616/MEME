import { Tag } from "@arco-design/web-react";
import { ADMIN_ROLE_LABELS } from "@/constants/admin-rbac";
import { adminRoleTagColor } from "@/constants/admin-role-ui";
import type { AdminRole } from "@/lib/session";

type AdminRoleTagProps = {
  role: AdminRole;
  size?: "small" | "default" | "medium" | "large";
};

export function AdminRoleTag({ role, size = "small" }: AdminRoleTagProps) {
  return (
    <Tag color={adminRoleTagColor(role)} size={size}>
      {ADMIN_ROLE_LABELS[role] ?? role}
    </Tag>
  );
}

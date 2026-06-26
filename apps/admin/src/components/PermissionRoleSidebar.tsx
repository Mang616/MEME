import { Tag, Typography } from "@arco-design/web-react";
import { AdminRoleAvatar } from "@/components/AdminRoleAvatar";
import { AdminRoleTag } from "@/components/AdminRoleTag";
import { ADMIN_ROLE_DESCRIPTIONS, permissionsEqual } from "@/constants/admin-rbac";
import type { AdminRoleRow } from "@/lib/api";
import type { PermissionMatrixState } from "@/lib/rbac-ui";
import type { AdminRole } from "@/lib/session";

type PermissionRoleSidebarProps = {
  roles: AdminRoleRow[];
  activeRole: AdminRole | null;
  matrix: PermissionMatrixState | null;
  saved: PermissionMatrixState | null;
  onSelect: (role: AdminRole) => void;
};

export function PermissionRoleSidebar({
  roles,
  activeRole,
  matrix,
  saved,
  onSelect,
}: PermissionRoleSidebarProps) {
  return (
    <aside className="permission-workspace__sidebar">
      <div className="permission-workspace__sidebar-head">
        <Typography.Text type="secondary">选择角色</Typography.Text>
      </div>
      <div className="permission-workspace__role-list">
        {roles.map((row) => {
          const dirty =
            matrix &&
            saved &&
            !row.locked &&
            !permissionsEqual(matrix[row.id], saved[row.id]);

          return (
            <button
              key={row.id}
              type="button"
              className={`permission-role-item${row.id === activeRole ? " permission-role-item--active" : ""}`}
              onClick={() => onSelect(row.id)}
            >
              <div className="permission-role-item__head">
                <AdminRoleAvatar role={row.id} size={36} />
                <div className="permission-role-item__head-text">
                  <div className="permission-role-item__top">
                    <AdminRoleTag role={row.id} />
                    {dirty ? <span className="permission-role-item__dot" title="未保存" /> : null}
                  </div>
                  <span className="permission-role-item__desc">{ADMIN_ROLE_DESCRIPTIONS[row.id]}</span>
                </div>
              </div>
              <div className="permission-role-item__meta">
                <Tag color={row.locked ? "gold" : "arcoblue"}>{row.permissionCount} 项权限</Tag>
                {row.locked ? <Tag color="gray">系统锁定</Tag> : null}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

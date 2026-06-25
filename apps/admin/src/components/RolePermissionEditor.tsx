import { Checkbox, Space, Tag, Typography } from "@arco-design/web-react";
import { ADMIN_ROLE_DESCRIPTIONS, permissionLabel } from "@/constants/admin-rbac";
import type { AdminPermission, AdminRole } from "@/lib/session";

export type PermissionGroup = {
  label: string;
  permissions: AdminPermission[];
};

type RolePermissionEditorProps = {
  role: AdminRole;
  roleLabel: string;
  locked: boolean;
  groups: PermissionGroup[];
  permissions: AdminPermission[];
  canWrite: boolean;
  onToggle: (permission: AdminPermission, checked: boolean) => void;
};

function RolePermEditorHeader({ role, roleLabel }: { role: AdminRole; roleLabel: string }) {
  return (
    <header className="role-perm-editor__head">
      <Typography.Title heading={6} style={{ margin: 0 }}>
        {roleLabel}
      </Typography.Title>
      <Typography.Text type="secondary">{ADMIN_ROLE_DESCRIPTIONS[role]}</Typography.Text>
    </header>
  );
}

export function RolePermissionEditor({
  role,
  roleLabel,
  locked,
  groups,
  permissions,
  canWrite,
  onToggle,
}: RolePermissionEditorProps) {
  const permissionSet = new Set(permissions);

  return (
    <div className="role-perm-editor">
      <RolePermEditorHeader role={role} roleLabel={roleLabel} />

      {locked ? (
        <>
          <Typography.Paragraph type="secondary">
            超级管理员拥有全部后台权限，无需单独配置。
          </Typography.Paragraph>
          <Space wrap>
            {permissions.map((perm) => (
              <Tag key={perm} color="green">
                {permissionLabel(perm)}
              </Tag>
            ))}
          </Space>
        </>
      ) : (
        <div className="role-perm-editor__groups">
          {groups.map((group) => (
            <section key={group.label} className="role-perm-editor__group">
              <Typography.Text bold className="role-perm-editor__group-title">
                {group.label}
              </Typography.Text>
              <div className="role-perm-editor__items">
                {group.permissions.map((perm) => (
                  <label key={perm} className="role-perm-editor__item">
                    <Checkbox
                      checked={permissionSet.has(perm)}
                      disabled={!canWrite}
                      onChange={(checked) => onToggle(perm, checked)}
                    />
                    <span>{permissionLabel(perm)}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

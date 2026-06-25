import { Space, Tag, Typography } from "@arco-design/web-react";
import { AdminSessionAvatar } from "@/components/AdminSessionAvatar";
import { ADMIN_ROLE_LABELS } from "@/constants/admin-rbac";
import type { AdminSession } from "@/lib/session";

type AdminUserProfileProps = {
  session: AdminSession;
  avatarSize?: number;
  showTags?: boolean;
};

export function AdminUserProfile({ session, avatarSize = 40, showTags = true }: AdminUserProfileProps) {
  return (
    <Space align="start" size={12}>
      <AdminSessionAvatar session={session} size={avatarSize} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <Typography.Text bold ellipsis style={{ display: "block", marginBottom: 2 }}>
          {session.displayName}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          @{session.username}
        </Typography.Text>
        {showTags ? (
          <Space wrap size={4} style={{ marginTop: 8 }}>
            {session.roles.map((role) => (
              <Tag key={role} color="arcoblue">
                {ADMIN_ROLE_LABELS[role] ?? role}
              </Tag>
            ))}
          </Space>
        ) : null}
      </div>
    </Space>
  );
}

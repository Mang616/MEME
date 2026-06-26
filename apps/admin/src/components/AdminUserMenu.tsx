import { Divider, Dropdown, Menu } from "@arco-design/web-react";
import { IconDown, IconPoweroff, IconSettings } from "@arco-design/web-react/icon";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSessionAvatar } from "@/components/AdminSessionAvatar";
import { AdminUserProfile } from "@/components/AdminUserProfile";
import { roleLabels as formatRoleLabels } from "@/constants/admin-rbac";
import { useAdminSession } from "@/hooks/useAdminSession";
import { logout } from "@/lib/auth";
import { ProfileSettingsModal } from "./ProfileSettingsModal";

export function AdminUserMenu() {
  const navigate = useNavigate();
  const [session, setSession] = useAdminSession();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const roleText = useMemo(() => formatRoleLabels(session?.roles ?? []).join(" · "), [session?.roles]);

  if (!session) return null;

  const dropList = (
    <Menu
      style={{ minWidth: 240, padding: "4px 0" }}
      onClickMenuItem={(key) => {
        if (key === "settings") {
          setSettingsOpen(true);
          return;
        }
        if (key === "logout") {
          void logout().then(() => navigate("/login", { replace: true }));
        }
      }}
    >
      <div className="admin-user-dropdown__profile">
        <AdminUserProfile session={session} />
      </div>
      <Divider style={{ margin: "4px 0" }} />
      <Menu.Item key="settings">
        <IconSettings style={{ marginRight: 8 }} />
        个人设置
      </Menu.Item>
      <Menu.Item key="logout">
        <IconPoweroff style={{ marginRight: 8 }} />
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown droplist={dropList} position="br" trigger="click">
        <button type="button" className="admin-user-trigger">
          <AdminSessionAvatar session={session} size={32} />
          <span className="admin-user-trigger__text">
          <span className="admin-user-trigger__name">{session.displayName}</span>
          <span className="admin-user-trigger__role">{roleText}</span>
          </span>
          <IconDown className="admin-user-trigger__icon" />
        </button>
      </Dropdown>

      <ProfileSettingsModal
        visible={settingsOpen}
        session={session}
        onClose={() => setSettingsOpen(false)}
        onUpdated={setSession}
      />
    </>
  );
}

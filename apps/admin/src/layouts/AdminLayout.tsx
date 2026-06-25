import { Layout, Menu } from "@arco-design/web-react";
import { IconImage } from "@arco-design/web-react/icon";
import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AdminNavMenuLabel, AdminNavSubMenuTitle } from "@/components/AdminNavMenuLabel";
import { AdminSidebarBrand } from "@/components/AdminSidebarBrand";
import { AdminUserMenu } from "@/components/AdminUserMenu";
import { AdminLivePollProvider } from "@/contexts/AdminLivePollContext";
import { VipConfigProvider } from "@/contexts/VipConfigContext";
import {
  filterNavGroups,
  resolveNavPath,
  resolveOpenMenuKeys,
} from "@/config/navigation";
import { hasAnyPermission } from "@/lib/session";
import { memeColors } from "@/theme/arco-theme";

const { Sider, Header, Content } = Layout;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

function AdminLayoutShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = useMemo(
    () => resolveNavPath(location.pathname),
    [location.pathname],
  );

  const openKeys = resolveOpenMenuKeys(location.pathname);
  const visibleGroups = filterNavGroups((perms) => hasAnyPermission(perms));

  return (
    <Layout className="admin-layout">
      <Sider
        className="admin-sider"
        theme="dark"
        collapsible
        breakpoint="lg"
        style={{ background: memeColors.siderBg }}
      >
        <AdminSidebarBrand />
        <Menu
          key={location.pathname}
          theme="dark"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys ?? []}
          style={{ background: "transparent" }}
          onClickMenuItem={(key) => navigate(key)}
        >
          {visibleGroups.map((group) => {
            if (group.key && group.label) {
              const GroupIcon = group.icon ?? IconImage;
              return (
                <SubMenu
                  key={group.key}
                  title={
                    <>
                      <GroupIcon />
                      <AdminNavSubMenuTitle
                        label={group.label}
                        showChatDot={group.groupBadge === "chatUnread"}
                      />
                    </>
                  }
                >
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <MenuItem
                        key={`/${item.path}`}
                        className={item.featured ? "admin-menu-item--featured" : undefined}
                      >
                        <ItemIcon />
                        <AdminNavMenuLabel label={item.label} badge={item.navBadge} />
                      </MenuItem>
                    );
                  })}
                </SubMenu>
              );
            }

            return group.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <MenuItem
                  key={`/${item.path}`}
                  className={item.featured ? "admin-menu-item--featured" : undefined}
                >
                  <ItemIcon />
                  <AdminNavMenuLabel label={item.label} badge={item.navBadge} />
                </MenuItem>
              );
            });
          })}
        </Menu>
      </Sider>
      <Layout className="admin-main">
        <Header className="admin-header">
          <span className="admin-header__label">MEME Admin</span>
          <AdminUserMenu />
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default function AdminLayout() {
  return (
    <VipConfigProvider>
      <AdminLivePollProvider>
        <AdminLayoutShell />
      </AdminLivePollProvider>
    </VipConfigProvider>
  );
}

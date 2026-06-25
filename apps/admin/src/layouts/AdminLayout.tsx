import {
  IconImage,
  IconPoweroff,
} from "@arco-design/web-react/icon";
import { Button, Layout, Menu, Typography } from "@arco-design/web-react";
import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  contentMenuOpen,
  NAV_GROUPS,
  resolveNavPath,
} from "@/config/navigation";
import { logout } from "@/lib/auth";
import { memeColors } from "@/theme/arco-theme";

const { Sider, Header, Content } = Layout;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = useMemo(
    () => resolveNavPath(location.pathname),
    [location.pathname],
  );

  const openKeys = contentMenuOpen(location.pathname);

  return (
    <Layout className="admin-layout">
      <Sider
        className="admin-sider"
        theme="dark"
        collapsible
        breakpoint="lg"
        style={{ background: memeColors.siderBg }}
      >
        <div className="admin-brand">
          <Typography.Title heading={5} style={{ margin: 0, color: memeColors.mint }}>
            迷因电竞
          </Typography.Title>
          <Typography.Text style={{ fontSize: 12, color: memeColors.siderText }}>
            运营后台
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          style={{ background: "transparent" }}
          onClickMenuItem={(key) => navigate(key)}
        >
          {NAV_GROUPS.map((group) => {
            if (group.key && group.label) {
              const GroupIcon = group.icon ?? IconImage;
              return (
                <SubMenu
                  key={group.key}
                  title={
                    <>
                      <GroupIcon />
                      {group.label}
                    </>
                  }
                >
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <MenuItem key={`/${item.path}`}>
                        <ItemIcon />
                        {item.label}
                      </MenuItem>
                    );
                  })}
                </SubMenu>
              );
            }

            return group.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <MenuItem key={`/${item.path}`}>
                  <ItemIcon />
                  {item.label}
                </MenuItem>
              );
            });
          })}
        </Menu>
      </Sider>
      <Layout className="admin-main">
        <Header className="admin-header">
          <Typography.Text type="secondary">MEME Admin</Typography.Text>
          <Button
            type="text"
            icon={<IconPoweroff />}
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            退出
          </Button>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

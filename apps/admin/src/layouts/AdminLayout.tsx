import {
  IconApps,
  IconFile,
  IconPoweroff,
  IconUserGroup,
} from "@arco-design/web-react/icon";
import { Button, Layout, Menu, Typography } from "@arco-design/web-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/lib/auth";
import { memeColors } from "@/theme/arco-theme";

const { Sider, Header, Content } = Layout;
const MenuItem = Menu.Item;

const MENU_ITEMS = [
  { key: "/orders", icon: <IconFile />, label: "订单管理" },
  { key: "/products", icon: <IconApps />, label: "商品管理" },
  { key: "/handlers", icon: <IconUserGroup />, label: "打手管理" },
] as const;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedKey =
    MENU_ITEMS.find((item) => location.pathname.startsWith(item.key))?.key ??
    "/orders";

  return (
    <Layout className="admin-layout">
      <Sider
        className="admin-sider"
        collapsible
        breakpoint="lg"
        style={{ background: memeColors.siderBg }}
      >
        <div className="admin-brand">
          <Typography.Title heading={5} style={{ margin: 0, color: memeColors.mint }}>
            迷因电竞
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            运营后台
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[selectedKey]}
          style={{ background: "transparent" }}
          onClickMenuItem={(key) => navigate(key)}
        >
          {MENU_ITEMS.map((item) => (
            <MenuItem key={item.key}>
              {item.icon}
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Sider>
      <Layout>
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

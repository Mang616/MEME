import { Typography } from "@arco-design/web-react";
import pepeSidebar from "@/assets/pepe-sidebar.webp";
import { memeColors } from "@/theme/arco-theme";

export function AdminSidebarBrand() {
  return (
    <div className="admin-brand-wrap">
      <div className="admin-brand">
        <img
          className="admin-brand__logo"
          src="/favicon.png"
          alt="迷因电竞"
          width={32}
          height={32}
          decoding="async"
          draggable={false}
        />
        <div className="admin-brand__text">
          <Typography.Title heading={5} style={{ margin: 0, color: memeColors.mint }}>
            迷因电竞
          </Typography.Title>
          <Typography.Text style={{ fontSize: 12, color: memeColors.siderText }}>
            运营后台
          </Typography.Text>
        </div>
      </div>
      <img
        className="admin-brand__pepe"
        src={pepeSidebar}
        alt=""
        aria-hidden
        width={112}
        height={54}
        decoding="async"
        draggable={false}
      />
    </div>
  );
}

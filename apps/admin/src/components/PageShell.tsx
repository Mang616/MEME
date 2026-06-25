import { Card, Space, Spin, Typography } from "@arco-design/web-react";
import type { ReactNode } from "react";
import { DEFAULT_TABLE_PAGINATION } from "@/constants/table";

type PageShellProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  /** 无边框 Card 包裹，适用于会话/权限等自带容器的页面 */
  bare?: boolean;
  children: ReactNode;
};

export function PageShell({
  title,
  subtitle,
  action,
  loading = false,
  bare = false,
  children,
}: PageShellProps) {
  const body = bare ? (
    <div className="page-shell-bare">
      <Spin loading={loading} style={{ width: "100%", display: "flex", flexDirection: "column", flex: 1 }}>
        {children}
      </Spin>
    </div>
  ) : (
    <Card bordered={false}>
      <Spin loading={loading} style={{ width: "100%" }}>
        {children}
      </Spin>
    </Card>
  );

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div className="page-header">
        <div className="page-header__body">
          <Typography.Title heading={5} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text type="secondary" className="page-header__subtitle" style={{ fontSize: 13 }}>
              {subtitle}
            </Typography.Text>
          ) : null}
        </div>
        {action}
      </div>
      {body}
    </Space>
  );
}

export { DEFAULT_TABLE_PAGINATION };

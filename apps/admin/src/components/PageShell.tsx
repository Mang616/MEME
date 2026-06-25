import { Card, Space, Spin, Typography } from "@arco-design/web-react";
import type { ReactNode } from "react";
import { DEFAULT_TABLE_PAGINATION } from "@/constants/table";

type PageShellProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  children: ReactNode;
};

export function PageShell({ title, subtitle, action, loading = false, children }: PageShellProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <div className="page-header">
        <div>
          <Typography.Title heading={5} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {subtitle ? (
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {subtitle}
            </Typography.Text>
          ) : null}
        </div>
        {action}
      </div>
      <Card bordered={false}>
        <Spin loading={loading} style={{ width: "100%" }}>
          {children}
        </Spin>
      </Card>
    </Space>
  );
}

export { DEFAULT_TABLE_PAGINATION };

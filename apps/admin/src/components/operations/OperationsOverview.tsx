import { Button, Card, Grid, Space, Statistic, Typography } from "@arco-design/web-react";
import {
  IconApps,
  IconCustomerService,
  IconFile,
  IconRight,
  IconStorage,
  IconThunderbolt,
  IconUser,
} from "@arco-design/web-react/icon";
import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import type { AdminPermission } from "@/lib/session";
import { hasAnyPermission } from "@/lib/session";
import type { AnalyticsOverview, OrderStatus } from "@/lib/api";
import { ORDER_STATUS_MAP } from "@/constants/labels";

const { Row, Col } = Grid;

type OperationsOverviewProps = {
  data: AnalyticsOverview;
};

const STATUS_ORDER: OrderStatus[] = [
  "pending_accept",
  "pending_confirm",
  "completed",
  "after_sale",
];

const STATUS_BAR_CLASS: Record<OrderStatus, string> = {
  pending_accept: "operations-status-bar__fill--pending_accept",
  pending_confirm: "operations-status-bar__fill--pending_confirm",
  completed: "operations-status-bar__fill--completed",
  after_sale: "operations-status-bar__fill--after_sale",
};

type Shortcut = {
  to: string;
  label: string;
  icon: ComponentType;
  permissions: AdminPermission[];
};

const SHORTCUTS: Shortcut[] = [
  { to: "/analytics", label: "数据看板", icon: IconStorage, permissions: ["analytics.read"] },
  { to: "/products", label: "商品管理", icon: IconApps, permissions: ["products.read"] },
  { to: "/users", label: "用户管理", icon: IconUser, permissions: ["users.read"] },
  { to: "/orders", label: "全部订单", icon: IconFile, permissions: ["orders.read"] },
];

type PriorityItem = {
  key: string;
  label: string;
  count: number;
  urgent?: boolean;
  to: string;
  actionLabel: string;
  permissions: AdminPermission[];
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography.Title heading={6} className="operations-section__title">
      {children}
    </Typography.Title>
  );
}

function KpiCard({
  icon,
  iconClass,
  title,
  value,
  suffix,
  prefix,
  precision,
  valueStyle,
  hint,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  precision?: number;
  valueStyle?: React.CSSProperties;
  hint?: string;
}) {
  return (
    <Card bordered={false} className="operations-kpi-card">
      <div className="operations-kpi-card__inner">
        <div className={`operations-kpi-card__icon ${iconClass}`}>{icon}</div>
        <div className="operations-kpi-card__body">
          <Statistic
            title={title}
            value={value}
            suffix={suffix}
            prefix={prefix}
            precision={precision}
            groupSeparator
            styleValue={valueStyle}
          />
          {hint ? (
            <Typography.Text type="secondary" className="operations-kpi-card__hint">
              {hint}
            </Typography.Text>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="operations-metric-row">
      <Typography.Text type="secondary">{label}</Typography.Text>
      <Typography.Text bold>{value}</Typography.Text>
    </div>
  );
}

export function OperationsOverview({ data }: OperationsOverviewProps) {
  const pendingAccept = data.orders.byStatus.pending_accept ?? 0;
  const pendingConfirm = data.orders.byStatus.pending_confirm ?? 0;
  const pendingOrders = pendingAccept + pendingConfirm;
  const afterSale = data.orders.byStatus.after_sale ?? 0;
  const unread = data.service.unread ?? 0;
  const feedbacks = data.service.feedbacks ?? 0;

  const priorities: PriorityItem[] = [
    {
      key: "accept",
      label: "待接单",
      count: pendingAccept,
      urgent: pendingAccept > 0,
      to: "/hall",
      actionLabel: "接单大厅",
      permissions: ["orders.accept"],
    },
    {
      key: "confirm",
      label: "待确认",
      count: pendingConfirm,
      urgent: pendingConfirm > 0,
      to: "/orders/dispatch",
      actionLabel: "订单派单",
      permissions: ["orders.dispatch", "orders.write"],
    },
    {
      key: "chat",
      label: "未读消息",
      count: unread,
      urgent: unread > 0,
      to: "/service/chats",
      actionLabel: "会话管理",
      permissions: ["chats.service", "chats.player"],
    },
    {
      key: "feedback",
      label: "用户反馈",
      count: feedbacks,
      urgent: feedbacks > 0,
      to: "/service/feedbacks",
      actionLabel: "查看反馈",
      permissions: ["feedbacks.read"],
    },
    {
      key: "after_sale",
      label: "售后中",
      count: afterSale,
      urgent: afterSale > 0,
      to: "/after-sales/orders",
      actionLabel: "售后工单",
      permissions: ["after_sales.read"],
    },
  ].filter((item) => hasAnyPermission(item.permissions));

  const visibleShortcuts = SHORTCUTS.filter((item) => hasAnyPermission(item.permissions));

  return (
    <Space direction="vertical" size={20} className="operations-overview">
      <section className="operations-section">
        <SectionTitle>核心指标</SectionTitle>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} xl={6}>
            <KpiCard
              icon={<IconFile />}
              iconClass="operations-kpi-card__icon--orders"
              title="待办订单"
              value={pendingOrders}
              valueStyle={pendingOrders > 0 ? { color: "#F53F3F" } : undefined}
              hint={`待接单 ${pendingAccept} · 待确认 ${pendingConfirm}`}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <KpiCard
              icon={<IconStorage />}
              iconClass="operations-kpi-card__icon--revenue"
              title="成交总额"
              value={data.orders.revenue}
              prefix="¥"
              precision={2}
              hint={`累计 ${data.orders.total} 单`}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <KpiCard
              icon={<IconThunderbolt />}
              iconClass="operations-kpi-card__icon--handlers"
              title="在线服务者"
              value={data.handlers.online}
              suffix={`/ ${data.handlers.total}`}
            />
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <KpiCard
              icon={<IconCustomerService />}
              iconClass="operations-kpi-card__icon--service"
              title="活跃会话"
              value={data.service.conversations}
              hint={unread > 0 ? `${unread} 条未读` : "暂无未读"}
            />
          </Col>
        </Row>
      </section>

      {priorities.length > 0 ? (
        <section className="operations-section">
          <SectionTitle>待办事项</SectionTitle>
          <Card bordered={false} className="operations-priority-card">
            <div className="operations-priority-list">
              {priorities.map((item) => (
                <div
                  key={item.key}
                  className={`operations-priority-item${item.urgent ? " operations-priority-item--urgent" : ""}`}
                >
                  <div className="operations-priority-item__main">
                    <Typography.Text>{item.label}</Typography.Text>
                    <Typography.Text
                      bold
                      className="operations-priority-item__count"
                      style={item.urgent ? { color: "#F53F3F" } : undefined}
                    >
                      {item.count}
                    </Typography.Text>
                  </div>
                  <Link to={item.to}>
                    <Button type={item.urgent ? "primary" : "text"} size="small">
                      {item.actionLabel}
                      <IconRight />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : null}

      <section className="operations-section">
        <SectionTitle>数据概览</SectionTitle>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card bordered={false} title="订单状态分布" className="operations-status-card">
              <Space direction="vertical" size={14} style={{ width: "100%" }}>
                {STATUS_ORDER.map((status) => {
                  const count = data.orders.byStatus[status] ?? 0;
                  const total = data.orders.total || 1;
                  const percent = Math.round((count / total) * 100);
                  const meta = ORDER_STATUS_MAP[status];
                  return (
                    <div key={status} className="operations-status-row">
                      <div className="operations-status-row__head">
                        <Typography.Text>{meta.label}</Typography.Text>
                        <Typography.Text type="secondary">
                          {count} 单 · {percent}%
                        </Typography.Text>
                      </div>
                      <div className="operations-status-bar">
                        <div
                          className={`operations-status-bar__fill ${STATUS_BAR_CLASS[status]}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card bordered={false} title="资源统计" className="operations-metrics-card">
              <div className="operations-metrics-list">
                <MetricRow
                  label="在售商品"
                  value={`${data.products.published} / ${data.products.total}`}
                />
                <MetricRow label="累计销量" value={data.products.sold} />
                <MetricRow
                  label="活跃用户"
                  value={`${data.users.active} / ${data.users.total}`}
                />
                <MetricRow
                  label="已完成订单"
                  value={data.orders.byStatus.completed ?? 0}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {visibleShortcuts.length > 0 ? (
        <section className="operations-section">
          <SectionTitle>快捷入口</SectionTitle>
          <div className="operations-shortcuts">
            {visibleShortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.to} to={item.to} className="operations-shortcut">
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </Space>
  );
}

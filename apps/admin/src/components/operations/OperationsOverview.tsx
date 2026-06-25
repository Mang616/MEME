import {
  Button,
  Card,
  Grid,
  Space,
  Statistic,
  Typography,
} from "@arco-design/web-react";
import {
  IconApps,
  IconCustomerService,
  IconExclamationCircle,
  IconFile,
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

type QuickLink = {
  to: string;
  label: string;
  desc: string;
  icon: ComponentType;
  permissions: AdminPermission[];
};

const QUICK_LINKS: QuickLink[] = [
  {
    to: "/hall",
    label: "接单大厅",
    desc: "抢单履约",
    icon: IconThunderbolt,
    permissions: ["orders.accept"],
  },
  {
    to: "/orders/dispatch",
    label: "订单派单",
    desc: "指定打手",
    icon: IconFile,
    permissions: ["orders.dispatch", "orders.write"],
  },
  {
    to: "/analytics",
    label: "数据看板",
    desc: "趋势分析",
    icon: IconStorage,
    permissions: ["analytics.read"],
  },
  {
    to: "/products",
    label: "商品管理",
    desc: "上下架维护",
    icon: IconApps,
    permissions: ["products.read"],
  },
  {
    to: "/service/chats",
    label: "会话管理",
    desc: "客服沟通",
    icon: IconCustomerService,
    permissions: ["chats.service", "chats.player"],
  },
  {
    to: "/users",
    label: "用户管理",
    desc: "会员资料",
    icon: IconUser,
    permissions: ["users.read"],
  },
];

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

function TodoCard({
  title,
  badge,
  badgeTone = "default",
  description,
  action,
}: {
  title: string;
  badge?: string;
  badgeTone?: "default" | "danger" | "muted";
  description: string;
  action: ReactNode;
}) {
  return (
    <Card
      bordered={false}
      className={`operations-todo-card operations-todo-card--${badgeTone}`}
      title={
        <span className="operations-todo-card__title-row">
          <span>{title}</span>
          {badge ? <span className="operations-todo-card__badge">{badge}</span> : null}
        </span>
      }
    >
      <Space direction="vertical" size={12} className="operations-todo-card__body">
        <Typography.Text type="secondary">{description}</Typography.Text>
        {action}
      </Space>
    </Card>
  );
}

export function OperationsOverview({ data }: OperationsOverviewProps) {
  const pendingAccept = data.orders.byStatus.pending_accept ?? 0;
  const pendingConfirm = data.orders.byStatus.pending_confirm ?? 0;
  const pendingOrders = pendingAccept + pendingConfirm;
  const afterSale = data.orders.byStatus.after_sale ?? 0;
  const unread = data.service.unread ?? 0;
  const feedbacks = data.service.feedbacks ?? 0;
  const visibleQuickLinks = QUICK_LINKS.filter((item) => hasAnyPermission(item.permissions));

  return (
    <Space direction="vertical" size={16} className="operations-overview">
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
            hint="打手与陪玩师在线数"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            icon={<IconCustomerService />}
            iconClass="operations-kpi-card__icon--service"
            title="未读消息"
            value={unread}
            valueStyle={unread > 0 ? { color: "#F53F3F" } : undefined}
            hint={`${data.service.conversations} 个会话 · ${feedbacks} 条反馈`}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={8}>
          <TodoCard
            title="订单履约"
            badge={pendingOrders > 0 ? `${pendingOrders} 单待处理` : "暂无积压"}
            badgeTone={pendingOrders > 0 ? "danger" : "muted"}
            description="优先处理待接单与待确认订单，必要时进入派单或接单大厅。"
            action={
              <Space wrap>
                {hasAnyPermission(["orders.accept"]) ? (
                  <Link to="/hall">
                    <Button type="primary" icon={<IconThunderbolt />}>
                      接单大厅
                    </Button>
                  </Link>
                ) : null}
                {hasAnyPermission(["orders.dispatch", "orders.write"]) ? (
                  <Link to="/orders/dispatch">
                    <Button type="outline" icon={<IconFile />}>
                      订单派单
                    </Button>
                  </Link>
                ) : null}
                {hasAnyPermission(["orders.read"]) ? (
                  <Link to="/orders">
                    <Button type="text">全部订单</Button>
                  </Link>
                ) : null}
              </Space>
            }
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <TodoCard
            title="客服与反馈"
            badge={unread > 0 ? `${unread} 条未读` : undefined}
            badgeTone={unread > 0 ? "danger" : "default"}
            description={`当前 ${data.service.conversations} 个会话，累计 ${feedbacks} 条用户反馈待查阅。`}
            action={
              <Space wrap>
                {hasAnyPermission(["chats.service", "chats.player"]) ? (
                  <Link to="/service/chats">
                    <Button type="primary" icon={<IconCustomerService />}>
                      会话管理
                    </Button>
                  </Link>
                ) : null}
                {hasAnyPermission(["feedbacks.read"]) ? (
                  <Link to="/service/feedbacks">
                    <Button type="outline">意见反馈</Button>
                  </Link>
                ) : null}
              </Space>
            }
          />
        </Col>
        <Col xs={24} md={12} xl={8}>
          <TodoCard
            title="售后跟进"
            badge={afterSale > 0 ? `${afterSale} 单售后中` : "暂无售后"}
            badgeTone={afterSale > 0 ? "danger" : "muted"}
            description="跟进售后中订单，协调打手与用户并完成结案。"
            action={
              hasAnyPermission(["after_sales.read"]) ? (
                <Link to="/after-sales/orders">
                  <Button type="primary" status="warning" icon={<IconExclamationCircle />}>
                    处理售后工单
                  </Button>
                </Link>
              ) : null
            }
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
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
        <Col xs={24} xl={10}>
          <Card bordered={false} title="资源概览" className="operations-resource-card">
            <div className="operations-resource-grid">
              <div className="operations-resource-item">
                <Typography.Text type="secondary">在售商品</Typography.Text>
                <Typography.Text bold>
                  {data.products.published} / {data.products.total}
                </Typography.Text>
              </div>
              <div className="operations-resource-item">
                <Typography.Text type="secondary">累计销量</Typography.Text>
                <Typography.Text bold>{data.products.sold}</Typography.Text>
              </div>
              <div className="operations-resource-item">
                <Typography.Text type="secondary">活跃用户</Typography.Text>
                <Typography.Text bold>
                  {data.users.active} / {data.users.total}
                </Typography.Text>
              </div>
              <div className="operations-resource-item">
                <Typography.Text type="secondary">已完成订单</Typography.Text>
                <Typography.Text bold>{data.orders.byStatus.completed ?? 0}</Typography.Text>
              </div>
            </div>
          </Card>

          {visibleQuickLinks.length > 0 ? (
            <Card bordered={false} title="快捷入口" className="operations-quick-card">
              <div className="operations-quick-grid">
                {visibleQuickLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.to} to={item.to} className="operations-quick-link">
                      <span className="operations-quick-link__icon">
                        <Icon />
                      </span>
                      <span className="operations-quick-link__text">
                        <span className="operations-quick-link__label">{item.label}</span>
                        <span className="operations-quick-link__desc">{item.desc}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>
          ) : null}
        </Col>
      </Row>
    </Space>
  );
}

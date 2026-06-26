import { Button, Typography } from "@arco-design/web-react";
import { IconThunderbolt } from "@arco-design/web-react/icon";
import { PriceBadge } from "@/components/PriceBadge";
import { HallOrderCover } from "@/components/hall/HallOrderCover";
import { ServiceTypeTag } from "@/components/ServiceTypeTag";
import { formatGamePortLabel } from "@/constants/game-port";
import type { HallOrderRow } from "@/lib/api";

type OrderGrabCardProps = {
  order: HallOrderRow;
  accepting: boolean;
  onAccept: () => void;
};

export function OrderGrabCard({ order, accepting, onAccept }: OrderGrabCardProps) {
  const gamePortLabel = formatGamePortLabel(order.gamePort);

  return (
    <article className="hall-order-card">
      <div className="hall-order-card__visual">
        <HallOrderCover
          cover={order.productCover}
          coverColor={order.productCoverColor}
          title={order.productTitle}
        />
        <span className="hall-order-card__port">{gamePortLabel}</span>
        <div className="hall-order-card__visual-foot">
          <PriceBadge value={order.totalPaid} size="sm" thin />
          {order.quantity > 1 ? (
            <span className="hall-order-card__qty">×{order.quantity}</span>
          ) : null}
          {order.serviceType ? (
            <ServiceTypeTag serviceType={order.serviceType} size="small" />
          ) : (
            <span className="hall-order-card__badge">待抢单</span>
          )}
        </div>
      </div>

      <div className="hall-order-card__body">
        <Typography.Title heading={6} className="hall-order-card__title" ellipsis={{ rows: 2 }}>
          {order.productTitle}
        </Typography.Title>

        <div className="hall-order-card__meta-row">
          {order.serviceType ? <ServiceTypeTag serviceType={order.serviceType} /> : null}
          <Typography.Text type="secondary" className="hall-order-card__port-inline">
            {gamePortLabel}
          </Typography.Text>
        </div>

        <Button
          type="primary"
          long
          size="large"
          className="hall-order-card__action"
          icon={<IconThunderbolt />}
          loading={accepting}
          onClick={onAccept}
        >
          立即接单
        </Button>
      </div>
    </article>
  );
}

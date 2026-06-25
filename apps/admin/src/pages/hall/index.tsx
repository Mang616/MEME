import { Alert, Button, Empty, Spin, Switch, Typography } from "@arco-design/web-react";
import { IconRefresh, IconThunderbolt } from "@arco-design/web-react/icon";
import { useMemo, useState } from "react";
import { OrderGrabCard } from "@/components/hall/OrderGrabCard";
import { ListFilterBar } from "@/components/ListFilterBar";
import { GAME_PORTS } from "@/constants/game-port";
import { useOrderHall } from "@/hooks/useOrderHall";
import { matchKeyword, matchSelect } from "@/lib/list-filter";

export default function OrderHallPage() {
  const {
    loading,
    refreshing,
    loadError,
    rows,
    acceptingId,
    autoRefresh,
    setAutoRefresh,
    load,
    handleAccept,
  } = useOrderHall();

  const [keyword, setKeyword] = useState("");
  const [portFilter, setPortFilter] = useState<string>("all");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!matchSelect(row.gamePort, portFilter)) return false;
      return matchKeyword([row.id, row.productTitle, row.gamePort], keyword);
    });
  }, [rows, keyword, portFilter]);

  function resetFilters() {
    setKeyword("");
    setPortFilter("all");
  }

  return (
    <div className="hall-page">
      <header className="hall-page__hero">
        <div className="hall-page__hero-main">
          <div className="hall-page__hero-icon" aria-hidden>
            <IconThunderbolt />
          </div>
          <div className="hall-page__hero-text">
            <Typography.Title heading={4} className="hall-page__title">
              接单大厅
            </Typography.Title>
            <Typography.Text type="secondary" className="hall-page__subtitle">
              仅展示商品信息 · 接单后可在会话中联系用户
            </Typography.Text>
          </div>
        </div>

        <div className="hall-page__hero-side">
          <div className="hall-page__stat">
            <span className="hall-page__stat-value">{filteredRows.length}</span>
            <span className="hall-page__stat-label">待抢订单</span>
          </div>
          <div className="hall-page__toolbar">
            <label className="hall-page__auto-refresh">
              <Switch size="small" checked={autoRefresh} onChange={setAutoRefresh} />
              <span>自动刷新</span>
            </label>
            <Button
              type="outline"
              loading={refreshing}
              icon={<IconRefresh />}
              onClick={() => void load()}
            >
              刷新
            </Button>
          </div>
        </div>
      </header>

      <ListFilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        keywordPlaceholder="搜索商品名称 / 订单号"
        selects={[
          {
            value: portFilter,
            onChange: setPortFilter,
            placeholder: "游戏端口",
            width: 140,
            options: [
              { value: "all", label: "全部端口" },
              ...GAME_PORTS.map((port) => ({ value: port, label: port })),
            ],
          },
        ]}
        total={rows.length}
        filtered={filteredRows.length}
        onReset={resetFilters}
      />

      <Spin loading={loading} className="hall-page__body">
        {loadError ? (
          <Alert type="error" content={loadError} style={{ marginBottom: 16 }} />
        ) : null}

        {!loading && filteredRows.length === 0 ? (
          <div className="hall-page__empty">
            <Empty
              icon={<IconThunderbolt style={{ fontSize: 48, color: "var(--color-text-4)" }} />}
              description={rows.length === 0 ? "暂无待抢订单，保持在线等待新单" : "没有匹配的订单，试试调整筛选条件"}
            />
          </div>
        ) : (
          <div className="hall-page__grid">
            {filteredRows.map((order) => (
              <OrderGrabCard
                key={order.id}
                order={order}
                accepting={acceptingId === order.id}
                onAccept={() => void handleAccept(order)}
              />
            ))}
          </div>
        )}
      </Spin>
    </div>
  );
}

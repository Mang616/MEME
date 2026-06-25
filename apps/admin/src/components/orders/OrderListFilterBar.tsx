import { ListFilterBar } from "@/components/ListFilterBar";
import { ORDER_STATUS_FILTER_OPTIONS } from "@/lib/order-list-filter";
import type { OrderRow } from "@/lib/api";

type OrderListFilterBarProps = {
  keyword: string;
  onKeywordChange: (value: string) => void;
  statusFilter: OrderRow["status"] | "all";
  onStatusFilterChange: (value: OrderRow["status"] | "all") => void;
  showStatusFilter?: boolean;
  total: number;
  filtered: number;
  onReset: () => void;
};

export function OrderListFilterBar({
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  showStatusFilter = true,
  total,
  filtered,
  onReset,
}: OrderListFilterBarProps) {
  return (
    <ListFilterBar
      keyword={keyword}
      onKeywordChange={onKeywordChange}
      keywordPlaceholder="搜索订单号 / 商品 / 游戏 ID / 打手"
      selects={
        showStatusFilter
          ? [
              {
                value: statusFilter,
                onChange: (value) => onStatusFilterChange(value as OrderRow["status"] | "all"),
                placeholder: "订单状态",
                width: 120,
                options: ORDER_STATUS_FILTER_OPTIONS,
              },
            ]
          : []
      }
      total={total}
      filtered={filtered}
      onReset={onReset}
    />
  );
}

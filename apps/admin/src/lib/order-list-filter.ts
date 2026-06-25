import { ORDER_STATUS_MAP } from "@/constants/labels";
import { matchKeyword, matchSelect } from "@/lib/list-filter";
import type { OrderRow } from "@/lib/api";

export const ORDER_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "全部状态" },
  ...Object.entries(ORDER_STATUS_MAP).map(([value, meta]) => ({
    value,
    label: meta.label,
  })),
];

export function matchOrderRow(row: OrderRow, keyword: string, statusFilter: OrderRow["status"] | "all") {
  if (!matchSelect(row.status, statusFilter)) return false;
  return matchKeyword(
    [
      row.id,
      row.productTitle,
      row.gameId,
      row.region,
      row.servicePlayer,
      row.assignedPlayer,
      row.remark,
      ORDER_STATUS_MAP[row.status]?.label,
    ],
    keyword,
  );
}

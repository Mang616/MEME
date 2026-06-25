export type ListFilterPrimitive = string | number | boolean | null | undefined;

/** 关键词匹配：任一字段包含即命中 */
export function matchKeyword(parts: ListFilterPrimitive[], keyword: string) {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  return parts
    .filter((part) => part !== null && part !== undefined && part !== "")
    .some((part) => String(part).toLowerCase().includes(q));
}

/** 下拉筛选：值为 all 时不过滤 */
export function matchSelect<T extends string>(value: T, filter: T | "all") {
  return filter === "all" || value === filter;
}

/** 布尔筛选：all / yes / no */
export function matchBoolFilter(value: boolean, filter: "all" | "yes" | "no") {
  if (filter === "all") return true;
  return filter === "yes" ? value : !value;
}

/** 数字等级筛选 */
export function matchNumberFilter(value: number, filter: string) {
  if (filter === "all") return true;
  const n = Number(filter);
  return Number.isFinite(n) && value === n;
}

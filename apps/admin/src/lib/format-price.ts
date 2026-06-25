/** 商品价格展示（与小程序 formatPriceDisplay 一致） */
export function formatPriceDisplay(value: number) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2).replace(/\.?0+$/, "");
}

/** 余额等金额，固定两位小数 */
export function formatMoney(value: number) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "¥0.00";
  return `¥${num.toFixed(2)}`;
}

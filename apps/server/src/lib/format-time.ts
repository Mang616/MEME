function pad2(value: number) {
  return String(value).padStart(2, "0");
}

/** `YYYY-MM-DD HH:mm:ss`，用于订单时间、公告有效期等 */
export function formatDateTime(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

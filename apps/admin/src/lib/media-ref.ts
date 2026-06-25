/** 数据库存储的 COS / 历史 images 路径前缀 */
export function isStoredMediaRef(value: string) {
  const raw = value.trim();
  return raw.startsWith("cos:") || raw.startsWith("images/") || raw.startsWith("meme/");
}

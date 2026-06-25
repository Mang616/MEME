/** 与 @meme/types ORDER_REGIONS 及小程序下单选项一致 */
export const GAME_PORTS = ["PC端游", "手游Android", "手游iOS"] as const;
export type GamePort = (typeof GAME_PORTS)[number];

const LEGACY_GAME_PORT_MAP: Record<string, GamePort | "手游"> = {
  端游: "PC端游",
  pc: "PC端游",
  PC端游: "PC端游",
  手游Android: "手游Android",
  mobile_android: "手游Android",
  手游iOS: "手游iOS",
  mobile_ios: "手游iOS",
  手游: "手游",
  mobile: "手游",
};

/** 将订单 region 规范为展示文案（兼容历史「端游 / 手游」） */
export function formatGamePortLabel(region: string | undefined | null) {
  const raw = String(region ?? "").trim();
  if (!raw) return "—";
  const mapped = LEGACY_GAME_PORT_MAP[raw];
  if (mapped) return mapped;
  return raw;
}

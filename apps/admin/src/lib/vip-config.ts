import type { VipConfigPayload, VipLevelConfigItem } from "@/lib/api";

export type { VipConfigPayload, VipLevelConfigItem as VipLevelDef };

export const VIP_MIN = 0;
export const VIP_MAX = 10;

/** 新建等级时的默认配色（背景与文字暂同色，可在表格中逐行修改） */
export const VIP_BADGE_BG = "#C9A020";
export const VIP_BADGE_COLOR = "#C9A020";

export const VIP_TITLES = [
  "新秀",
  "青铜",
  "白银",
  "黄金",
  "铂金",
  "钻石",
  "大师",
  "宗师",
  "王者",
  "传奇",
  "至尊",
] as const;

export function clampVipLevel(level: number, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  if (!Number.isFinite(level)) return vipMin;
  return Math.max(vipMin, Math.min(vipMax, Math.round(level)));
}

function normalizeLevelItem(
  item: Partial<VipLevelConfigItem> & { level: number },
): VipLevelConfigItem {
  const level = item.level;
  return {
    level,
    label: item.label?.trim() || `VIP${level}`,
    title: item.title?.trim() || VIP_TITLES[level] || `等级${level}`,
    icon: item.icon?.trim() ?? "",
    bg: item.bg?.trim() || VIP_BADGE_BG,
    color: item.color?.trim() || VIP_BADGE_COLOR,
  };
}

export function createEmptyLevelDef(level: number): VipLevelConfigItem {
  return normalizeLevelItem({ level });
}

export function buildDefaultLevelList(vipMin: number, vipMax: number): VipLevelConfigItem[] {
  if (!Number.isFinite(vipMin) || !Number.isFinite(vipMax) || vipMax < vipMin) {
    return [];
  }
  return Array.from({ length: vipMax - vipMin + 1 }, (_, index) =>
    createEmptyLevelDef(vipMin + index),
  );
}

export function normalizeVipConfig(payload: VipConfigPayload | undefined): VipConfigPayload {
  const vipMin = payload?.vipMin ?? VIP_MIN;
  const vipMax = payload?.vipMax ?? VIP_MAX;
  const levelList =
    payload?.levelList?.length && payload.levelList.length > 0
      ? payload.levelList.map((item) => normalizeLevelItem(item))
      : buildDefaultLevelList(vipMin, vipMax);
  return { vipMin, vipMax, levelList };
}

export function getVipLevelDef(
  config: VipConfigPayload,
  level: number | undefined | null,
): VipLevelConfigItem {
  const n = clampVipLevel(Number(level ?? config.vipMin), config.vipMin, config.vipMax);
  const found = config.levelList.find((item) => item.level === n);
  return found ? normalizeLevelItem(found) : createEmptyLevelDef(n);
}

export function buildVipLevelOptions(config: VipConfigPayload) {
  return [...config.levelList]
    .sort((a, b) => a.level - b.level)
    .map((item) => ({
      value: item.level,
      label: `${item.label || `VIP${item.level}`} · ${item.title || `等级${item.level}`}`,
    }));
}

/** 调整等级范围：保留已有行，新增行用默认配色 */
export function syncLevelListToRange(
  prevList: VipLevelConfigItem[],
  vipMin: number,
  vipMax: number,
): VipLevelConfigItem[] {
  const byLevel = new Map(prevList.map((item) => [item.level, item]));
  return buildDefaultLevelList(vipMin, vipMax).map((row) => {
    const existing = byLevel.get(row.level);
    return existing ? normalizeLevelItem(existing) : row;
  });
}

export function prepareVipConfigForSave(config: VipConfigPayload): VipConfigPayload {
  const sorted = [...config.levelList].sort((a, b) => a.level - b.level);
  return {
    vipMin: config.vipMin,
    vipMax: config.vipMax,
    levelList: sorted.map((item, index) =>
      normalizeLevelItem({ ...item, level: config.vipMin + index }),
    ),
  };
}

export function patchVipLevelList(
  list: VipLevelConfigItem[],
  level: number,
  patch: Partial<VipLevelConfigItem>,
) {
  return list.map((row) => (row.level === level ? { ...row, ...patch } : row));
}

export type VipPrivilegeRow = {
  id: string;
  name: string;
  value: string;
  unlocked: boolean;
};

export type VipLevelActivityItem = {
  level: number;
  cumulativeThreshold: number;
  upgradeTarget: number;
  privilegeRows: VipPrivilegeRow[];
};

export type VipActivityPayload = {
  consumeLabel: string;
  promotionRewardText: string;
  maxLevelHint: string;
  upgradeHintTemplate: string;
  sectionTitle: string;
  sectionSubtitleTemplate: string;
  levelList: VipLevelActivityItem[];
};

export const VIP_MIN: number;
export const VIP_MAX: number;
export const VIP_CUMULATIVE_THRESHOLDS: readonly number[];
export const PRIVILEGE_IDS: readonly string[];
export const VIP_ACTIVITY_COPY: Omit<VipActivityPayload, "levelList">;
export const VIP_ACTIVITY_DEFAULT: VipActivityPayload;

export function createDefaultPayload(vipMin?: number, vipMax?: number): VipActivityPayload;
export function getDefaultCumulativeThreshold(
  level: number,
  vipMin?: number,
  vipMax?: number,
): number;
export function calcUpgradeTarget(
  level: number,
  cumulativeThreshold: number,
  nextCumulativeThreshold: number,
  vipMax?: number,
): number;
export function buildPrivilegeRowsForLevel(
  level: number,
  vipMin?: number,
  vipMax?: number,
): VipPrivilegeRow[];
export function applyCumulativeThresholds(
  items: VipLevelActivityItem[],
  vipMax?: number,
  vipMin?: number,
): VipLevelActivityItem[];
export function createDefaultLevelActivity(
  level: number,
  vipMax?: number,
  vipMin?: number,
): VipLevelActivityItem;
export function buildDefaultLevelList(vipMin?: number, vipMax?: number): VipLevelActivityItem[];
export function normalizeVipActivityPayload(
  payload: Partial<VipActivityPayload> | null | undefined,
  vipMin?: number,
  vipMax?: number,
): VipActivityPayload;
export function syncLevelListToRange(
  prevList: VipLevelActivityItem[],
  vipMin: number,
  vipMax: number,
): VipLevelActivityItem[];
export function prepareVipActivityForSave(
  config: VipActivityPayload,
  vipMin: number,
  vipMax: number,
): VipActivityPayload;
export function patchLevelActivity(
  list: VipLevelActivityItem[],
  level: number,
  patch: Partial<VipLevelActivityItem>,
  vipMax?: number,
  vipMin?: number,
): VipLevelActivityItem[];
export function patchLevelPrivilege(
  list: VipLevelActivityItem[],
  level: number,
  privilegeId: string,
  patch: Partial<VipPrivilegeRow>,
): VipLevelActivityItem[];
export function resolveVipLevelFromTotalConsume(
  totalConsume: number,
  levelList: VipLevelActivityItem[],
  vipMin?: number,
  vipMax?: number,
): number;

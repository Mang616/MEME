import {
  VIP_MIN,
  VIP_MAX,
  VIP_CUMULATIVE_THRESHOLDS,
  VIP_ACTIVITY_DEFAULT,
  getDefaultCumulativeThreshold,
  calcUpgradeTarget,
  buildPrivilegeRowsForLevel,
  applyCumulativeThresholds,
  createDefaultLevelActivity,
  buildDefaultLevelList,
  normalizeVipActivityPayload as normalizeVipActivity,
  syncLevelListToRange,
  prepareVipActivityForSave,
  patchLevelActivity,
  patchLevelPrivilege,
} from "@meme/vip-activity-defaults";
import type { VipActivityPayload, VipLevelActivityItem, VipPrivilegeRow } from "@/lib/api";

export type { VipActivityPayload, VipLevelActivityItem, VipPrivilegeRow };

export {
  VIP_MIN,
  VIP_MAX,
  VIP_CUMULATIVE_THRESHOLDS,
  VIP_ACTIVITY_DEFAULT,
  getDefaultCumulativeThreshold,
  calcUpgradeTarget,
  buildPrivilegeRowsForLevel,
  applyCumulativeThresholds,
  createDefaultLevelActivity,
  buildDefaultLevelList,
  normalizeVipActivity,
  syncLevelListToRange,
  prepareVipActivityForSave,
  patchLevelActivity,
  patchLevelPrivilege,
};

/** @deprecated 请改用 @/lib/vip-config 与 useVipConfig */
export {
  VIP_MIN,
  VIP_MAX,
  VIP_BADGE_BG,
  VIP_BADGE_COLOR,
  VIP_TITLES,
  clampVipLevel,
  createEmptyLevelDef,
  getVipLevelDef,
  buildVipLevelOptions,
  normalizeVipConfig,
  type VipLevelDef,
} from "@/lib/vip-config";

export type { VipConfigPayload } from "@/lib/api";

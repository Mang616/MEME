import aceIcon from "@/assets/escort/ace.png";
import demonIcon from "@/assets/escort/demon.png";
import rookieIcon from "@/assets/escort/rookie.png";

/** 与小程序 escort-level.js、服务端 Handler.level 一致 */
export type EscortLevel = "demon" | "ace" | "rookie";

export const ESCORT_LEVELS: EscortLevel[] = ["demon", "ace", "rookie"];

export type EscortLevelDef = {
  id: EscortLevel;
  label: string;
  icon: string;
  badgeClass: string;
};

export const ESCORT_LEVEL_DEFS: Record<EscortLevel, EscortLevelDef> = {
  demon: {
    id: "demon",
    label: "魔王",
    icon: demonIcon,
    badgeClass: "escort-level--demon",
  },
  ace: {
    id: "ace",
    label: "王牌",
    icon: aceIcon,
    badgeClass: "escort-level--ace",
  },
  rookie: {
    id: "rookie",
    label: "新锐",
    icon: rookieIcon,
    badgeClass: "escort-level--rookie",
  },
};

export const ESCORT_LEVEL_MAP: Record<EscortLevel, string> = {
  demon: ESCORT_LEVEL_DEFS.demon.label,
  ace: ESCORT_LEVEL_DEFS.ace.label,
  rookie: ESCORT_LEVEL_DEFS.rookie.label,
};

export function getEscortLevelDef(level: string | undefined | null): EscortLevelDef | null {
  if (!level) return null;
  return ESCORT_LEVEL_DEFS[level as EscortLevel] ?? null;
}

export function escortLevelLabel(level: string | undefined | null) {
  return getEscortLevelDef(level)?.label ?? "—";
}

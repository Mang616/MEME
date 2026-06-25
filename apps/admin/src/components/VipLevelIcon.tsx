import type { ReactNode } from "react";
import { useVipConfig } from "@/contexts/VipConfigContext";
import { useSignedMediaUrl } from "@/hooks/useSignedMediaUrl";
import type { VipLevelConfigItem } from "@/lib/api";

type VipLevelIconProps = {
  level?: number | undefined | null;
  def?: VipLevelConfigItem;
  size?: "sm" | "md" | "badge";
};

function resolveDef(
  level: number | undefined | null,
  defProp: VipLevelConfigItem | undefined,
  getLevelDef: (level: number | undefined | null) => VipLevelConfigItem,
) {
  return defProp ?? getLevelDef(level);
}

export function VipLevelIcon({ level, def: defProp, size = "sm" }: VipLevelIconProps) {
  const { getLevelDef } = useVipConfig();
  const def = resolveDef(level, defProp, getLevelDef);
  const iconUrl = useSignedMediaUrl(def.icon);

  return (
    <span
      className={`vip-level-icon vip-level-icon--${size}`}
      title={`${def.label} ${def.title}`}
    >
      {iconUrl ? (
        <img src={iconUrl} alt="" className="vip-level-icon__img" aria-hidden draggable={false} />
      ) : (
        <span className="vip-level-icon__img vip-level-icon__img--empty" aria-hidden />
      )}
    </span>
  );
}

/** 胶囊徽章：图标 + VIPn（对齐小程序 profile-vip） */
export function VipLevelBadge({
  level,
  def: defProp,
  size = "sm",
}: {
  level?: number | undefined | null;
  def?: VipLevelConfigItem;
  size?: "sm" | "md";
}) {
  const { getLevelDef } = useVipConfig();
  const def = resolveDef(level, defProp, getLevelDef);

  return (
    <span
      className={`vip-level-badge vip-level-badge--${size}`}
      style={{ background: def.bg }}
      title={def.title}
    >
      <VipLevelIcon def={def} size="badge" />
      <span className="vip-level-badge__label" style={{ color: def.color }}>
        {def.label}
      </span>
    </span>
  );
}

/** 昵称 + VIP 胶囊（徽章置前，对齐小程序） */
export function VipLevelWithLabel({
  level,
  def,
  label,
  size = "sm",
}: {
  level?: number | undefined | null;
  def?: VipLevelConfigItem;
  label: ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <span className="level-with-label">
      <VipLevelBadge level={level} def={def} size={size} />
      <span className="level-with-label__text">{label}</span>
    </span>
  );
}

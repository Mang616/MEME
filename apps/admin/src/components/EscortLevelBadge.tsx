import type { ReactNode } from "react";
import { getEscortLevelDef, type EscortLevel } from "@/constants/escort-level";

type EscortLevelBadgeProps = {
  level: EscortLevel | string;
  size?: "sm" | "md";
};

export function EscortLevelBadge({ level, size = "sm" }: EscortLevelBadgeProps) {
  const def = getEscortLevelDef(level);
  if (!def) {
    return <span className="escort-level-badge escort-level-badge--empty">—</span>;
  }

  return (
    <span
      className={`escort-level-badge escort-level-badge--${size} ${def.badgeClass}`}
      title={def.label}
    >
      <img src={def.icon} alt="" className="escort-level-badge__icon" aria-hidden draggable={false} />
      <span className="escort-level-badge__label">{def.label}</span>
    </span>
  );
}

/** 等级胶囊 + 昵称（徽章置前，与 VIP 展示一致） */
export function EscortLevelWithLabel({
  level,
  label,
  size = "sm",
}: {
  level: EscortLevel | string;
  label: ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <span className="level-with-label">
      <EscortLevelBadge level={level} size={size} />
      <span className="level-with-label__text">{label}</span>
    </span>
  );
}

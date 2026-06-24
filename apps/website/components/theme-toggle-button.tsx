"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme-provider";
import { themeToggleIconSrc, themeToggleLabel } from "@/lib/theme";

/** 与小程序 navigation-bar 一致的主题切换按钮 */
export function ThemeToggleButton({ className = "meme-nav-theme" }: { className?: string }) {
  const { mode, resolved, cycleMode } = useTheme();
  const label = themeToggleLabel(mode, resolved);

  return (
    <button
      className={className}
      type="button"
      aria-label={label}
      title={label}
      onClick={cycleMode}
    >
      <Image
        className="theme-toggle-icon"
        src={themeToggleIconSrc(resolved)}
        alt=""
        width={24}
        height={24}
      />
    </button>
  );
}

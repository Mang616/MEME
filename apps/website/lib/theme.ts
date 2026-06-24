import { ASSETS } from "@/lib/site";

/** 主题：auto 按时段切换；light/dark 手动固定。与 layout 内联脚本保持一致。 */
export type ThemeMode = "auto" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

const THEME_STORAGE_KEY = "meme-theme-mode";
const LEGACY_STORAGE_KEY = "meme-theme";

/** 白天时段（含起不含止）：默认 7:00–19:00 使用浅色 */
const LIGHT_HOURS = { start: 7, end: 19 } as const;

function resolveThemeFromTime(
  date = new Date(),
  hours: typeof LIGHT_HOURS = LIGHT_HOURS,
): ResolvedTheme {
  const hour = date.getHours();
  return hour >= hours.start && hour < hours.end ? "light" : "dark";
}

function resolveTheme(mode: ThemeMode, date = new Date()): ResolvedTheme {
  if (mode === "light" || mode === "dark") return mode;
  return resolveThemeFromTime(date);
}

function normalizeThemeMode(value: string | null): ThemeMode {
  if (value === "auto" || value === "light" || value === "dark") return value;
  return "auto";
}

export function readThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "auto";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) return normalizeThemeMode(stored);
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy === "light" || legacy === "dark") return legacy;
  } catch {
    /* ignore storage errors */
  }
  return "auto";
}

export function writeThemeMode(mode: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

/** 写入 DOM 属性，供 CSS `[data-theme]` 使用 */
export function applyTheme(mode: ThemeMode, date = new Date()): ResolvedTheme {
  const resolved = resolveTheme(mode, date);
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-mode", mode);
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

export function cycleThemeMode(current: ThemeMode): ThemeMode {
  if (current === "auto") return "light";
  if (current === "light") return "dark";
  return "auto";
}

export function themeToggleLabel(mode: ThemeMode, resolved: ResolvedTheme = "dark"): string {
  if (mode === "auto") return `当前自动主题（${resolved === "dark" ? "深色" : "浅色"}），点击切换为浅色`;
  if (mode === "light") return "切换深色模式";
  return "切换为自动主题";
}

/** 与小程序一致：当前深色显示 dark 图标，浅色显示 light 图标 */
export function themeToggleIconSrc(resolved: ResolvedTheme): string {
  return resolved === "dark" ? ASSETS.themeDark : ASSETS.themeLight;
}

/** 首屏防闪烁：layout 内联脚本（须与 read/apply 逻辑保持一致） */
export const themeInitScript = `
(function () {
  var KEY = "${THEME_STORAGE_KEY}";
  var LEGACY = "${LEGACY_STORAGE_KEY}";
  var START = ${LIGHT_HOURS.start};
  var END = ${LIGHT_HOURS.end};
  function resolve(mode) {
    if (mode === "light" || mode === "dark") return mode;
    var h = new Date().getHours();
    return h >= START && h < END ? "light" : "dark";
  }
  function normalize(value) {
    if (value === "auto" || value === "light" || value === "dark") return value;
    return "auto";
  }
  try {
    var mode = normalize(localStorage.getItem(KEY));
    if (!localStorage.getItem(KEY)) {
      var legacy = localStorage.getItem(LEGACY);
      if (legacy === "light" || legacy === "dark") mode = legacy;
      else mode = "auto";
    }
    var resolved = resolve(mode);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-mode", mode);
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.setAttribute("data-theme-mode", "auto");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export type DatePreset = "today" | "yesterday" | "dayBefore" | "last7" | "last30" | "custom";

export type DateRangeValue = {
  preset: DatePreset;
  from: string;
  to: string;
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateInput(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function shiftDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function buildDateRange(preset: DatePreset, custom?: { from: string; to: string }): DateRangeValue {
  const today = startOfDay(new Date());

  if (preset === "today") {
    const key = toDateInput(today);
    return { preset, from: key, to: key };
  }
  if (preset === "yesterday") {
    const day = shiftDays(today, -1);
    const key = toDateInput(day);
    return { preset, from: key, to: key };
  }
  if (preset === "dayBefore") {
    const day = shiftDays(today, -2);
    const key = toDateInput(day);
    return { preset, from: key, to: key };
  }
  if (preset === "last7") {
    return { preset, from: toDateInput(shiftDays(today, -6)), to: toDateInput(today) };
  }
  if (preset === "last30") {
    return { preset, from: toDateInput(shiftDays(today, -29)), to: toDateInput(today) };
  }

  return {
    preset: "custom",
    from: custom?.from ?? toDateInput(shiftDays(today, -29)),
    to: custom?.to ?? toDateInput(today),
  };
}

export const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "today", label: "今天" },
  { value: "yesterday", label: "昨天" },
  { value: "dayBefore", label: "前天" },
  { value: "last7", label: "近 7 天" },
  { value: "last30", label: "近 30 天" },
  { value: "custom", label: "自定义" },
];

export function formatRangeLabel(from: string, to: string) {
  return from === to ? from : `${from} ~ ${to}`;
}

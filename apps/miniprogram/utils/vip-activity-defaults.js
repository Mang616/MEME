/**
 * 与 packages/vip-activity-defaults/index.js 同步，运行 npm run miniprogram:sync-vip-activity 更新。
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/vip-activity-defaults/index.js
var index_exports = {};
__export(index_exports, {
  PRIVILEGE_IDS: () => PRIVILEGE_IDS,
  VIP_ACTIVITY_COPY: () => VIP_ACTIVITY_COPY,
  VIP_ACTIVITY_DEFAULT: () => VIP_ACTIVITY_DEFAULT,
  VIP_CUMULATIVE_THRESHOLDS: () => VIP_CUMULATIVE_THRESHOLDS,
  VIP_MAX: () => VIP_MAX,
  VIP_MIN: () => VIP_MIN,
  applyCumulativeThresholds: () => applyCumulativeThresholds,
  buildDefaultLevelList: () => buildDefaultLevelList,
  buildPrivilegeRowsForLevel: () => buildPrivilegeRowsForLevel,
  calcUpgradeTarget: () => calcUpgradeTarget,
  createDefaultLevelActivity: () => createDefaultLevelActivity,
  createDefaultPayload: () => createDefaultPayload,
  getDefaultCumulativeThreshold: () => getDefaultCumulativeThreshold,
  normalizeVipActivityPayload: () => normalizeVipActivityPayload,
  patchLevelActivity: () => patchLevelActivity,
  patchLevelPrivilege: () => patchLevelPrivilege,
  prepareVipActivityForSave: () => prepareVipActivityForSave,
  resolveVipLevelFromTotalConsume: () => resolveVipLevelFromTotalConsume,
  syncLevelListToRange: () => syncLevelListToRange
});
module.exports = __toCommonJS(index_exports);
var VIP_MIN = 0;
var VIP_MAX = 10;
var VIP_CUMULATIVE_THRESHOLDS = [
  0,
  500,
  1e3,
  2e3,
  5e3,
  1e4,
  2e4,
  35e3,
  55e3,
  8e4,
  1e5
];
var PRIVILEGE_IDS = [
  "consume_reward",
  "upgrade_reward",
  "service",
  "birthday",
  "priority",
  "discount"
];
var VIP_ACTIVITY_COPY = {
  consumeLabel: "\u6D88\u8D39\u91D1\u989D",
  promotionRewardText: "\u5347\u7EA7\u7B49\u7EA7\u83B7\u53D6\u66F4\u591A\u6D88\u8D39\u5956\u52B1",
  maxLevelHint: "\u60A8\u5DF2\u8FBE\u5230\u6700\u9AD8\u7B49\u7EA7",
  upgradeHintTemplate: "\u8FD8\u9700{remain}\u5143{consumeLabel}\u53EF\u5347\u7EA7\u81F3{nextTag}",
  sectionTitle: "\u4F1A\u5458\u7279\u6743",
  sectionSubtitleTemplate: "{levelTag} \u4E13\u5C5E\u7279\u6743"
};
function clampLevel(level, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  return Math.max(vipMin, Math.min(vipMax, Math.round(Number(level) || 0)));
}
function getDefaultCumulativeThreshold(level, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  const n = clampLevel(level, vipMin, vipMax);
  return VIP_CUMULATIVE_THRESHOLDS[n] ?? 0;
}
function calcUpgradeTarget(level, cumulativeThreshold, nextCumulativeThreshold, vipMax = VIP_MAX) {
  if (level >= vipMax) return 0;
  return Math.max(0, nextCumulativeThreshold - cumulativeThreshold);
}
function buildPrivilegeRowsForLevel(level, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  const lv = clampLevel(level, vipMin, vipMax);
  return [
    {
      id: "consume_reward",
      name: "\u6D88\u8D39\u5956\u52B1",
      value: lv >= 1 ? `\u4E13\u4EAB\u4F18\u60E0\u5238\xD7${lv}` : "\u2014",
      unlocked: lv >= 1
    },
    {
      id: "upgrade_reward",
      name: "\u5347\u7EA7\u6D88\u8D39\u5956\u52B1",
      value: lv >= 1 ? `\u793C\u5238${lv * 100}\u5143` : "\u2014",
      unlocked: lv >= 1
    },
    {
      id: "service",
      name: "\u4E13\u5C5E\u5BA2\u670D",
      value: lv >= 3 ? "7\xD724 \u5728\u7EBF" : "V3 \u89E3\u9501",
      unlocked: lv >= 3
    },
    {
      id: "birthday",
      name: "\u751F\u65E5\u793C\u91D1",
      value: lv >= 5 ? `${lv * 50}\u5143` : "V5 \u89E3\u9501",
      unlocked: lv >= 5
    },
    {
      id: "priority",
      name: "\u4F18\u5148\u5339\u914D\u6253\u624B",
      value: lv >= 7 ? "\u5DF2\u5F00\u901A" : "V7 \u89E3\u9501",
      unlocked: lv >= 7
    },
    {
      id: "discount",
      name: "\u5168\u573A\u6298\u6263",
      value: lv >= 9 ? `${(99 - lv * 0.5).toFixed(1)}\u6298` : "V9 \u89E3\u9501",
      unlocked: lv >= 9
    }
  ];
}
function resolveLevelThresholds(items, vipMin, vipMax) {
  const sorted = [...items].sort((a, b) => a.level - b.level);
  const map = /* @__PURE__ */ new Map();
  for (const row of sorted) {
    map.set(
      row.level,
      row.cumulativeThreshold != null ? Math.max(0, Number(row.cumulativeThreshold) || 0) : getDefaultCumulativeThreshold(row.level, vipMin, vipMax)
    );
  }
  for (let level = vipMin; level <= vipMax; level += 1) {
    if (!map.has(level)) map.set(level, getDefaultCumulativeThreshold(level, vipMin, vipMax));
  }
  return map;
}
function applyCumulativeThresholds(items, vipMax = VIP_MAX, vipMin = VIP_MIN) {
  const thresholds = resolveLevelThresholds(items, vipMin, vipMax);
  return [...items].sort((a, b) => a.level - b.level).map((row) => {
    const cumulativeThreshold = thresholds.get(row.level) ?? getDefaultCumulativeThreshold(row.level, vipMin, vipMax);
    const nextCumulative = row.level >= vipMax ? cumulativeThreshold : thresholds.get(row.level + 1) ?? getDefaultCumulativeThreshold(row.level + 1, vipMin, vipMax);
    return {
      ...row,
      cumulativeThreshold,
      upgradeTarget: calcUpgradeTarget(
        row.level,
        cumulativeThreshold,
        nextCumulative,
        vipMax
      )
    };
  });
}
function createDefaultLevelActivity(level, vipMax = VIP_MAX, vipMin = VIP_MIN) {
  const cumulativeThreshold = getDefaultCumulativeThreshold(level, vipMin, vipMax);
  const nextCumulative = getDefaultCumulativeThreshold(
    Math.min(level + 1, vipMax),
    vipMin,
    vipMax
  );
  return {
    level,
    cumulativeThreshold,
    upgradeTarget: calcUpgradeTarget(level, cumulativeThreshold, nextCumulative, vipMax),
    privilegeRows: buildPrivilegeRowsForLevel(level, vipMin, vipMax)
  };
}
function buildDefaultLevelList(vipMin = VIP_MIN, vipMax = VIP_MAX) {
  const list = [];
  for (let level = vipMin; level <= vipMax; level += 1) {
    list.push(createDefaultLevelActivity(level, vipMax, vipMin));
  }
  return applyCumulativeThresholds(list, vipMax, vipMin);
}
function createDefaultPayload(vipMin = VIP_MIN, vipMax = VIP_MAX) {
  return {
    ...VIP_ACTIVITY_COPY,
    levelList: buildDefaultLevelList(vipMin, vipMax)
  };
}
var VIP_ACTIVITY_DEFAULT = createDefaultPayload(VIP_MIN, VIP_MAX);
function normalizePrivilegeRow(item) {
  const id = item?.id && String(item.id).trim() || "privilege";
  return {
    id,
    name: item?.name && String(item.name).trim() || id,
    value: item?.value != null ? String(item.value).trim() : "\u2014",
    unlocked: Boolean(item?.unlocked)
  };
}
function normalizeLevelItem(item, vipMax, vipMin) {
  const level = item.level;
  const defaults = createDefaultLevelActivity(level, vipMax, vipMin);
  const rows = Array.isArray(item.privilegeRows) && item.privilegeRows.length ? item.privilegeRows.map(normalizePrivilegeRow) : defaults.privilegeRows;
  const byId = new Map(rows.map((row) => [row.id, row]));
  const privilegeRows = PRIVILEGE_IDS.map(
    (id) => byId.get(id) ?? defaults.privilegeRows.find((row) => row.id === id)
  );
  const cumulativeThreshold = item.cumulativeThreshold != null ? Math.max(0, Number(item.cumulativeThreshold) || 0) : defaults.cumulativeThreshold;
  return {
    level,
    cumulativeThreshold,
    upgradeTarget: item.upgradeTarget != null ? Math.max(0, Number(item.upgradeTarget) || 0) : 0,
    privilegeRows
  };
}
function hasLegacyShape(payload) {
  return Boolean(payload?.levelRules || payload?.privilegeDefs);
}
function normalizeVipActivityPayload(payload, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  const base = payload && typeof payload === "object" ? payload : VIP_ACTIVITY_DEFAULT;
  const defaults = createDefaultPayload(vipMin, vipMax);
  let levelList;
  if (Array.isArray(base.levelList) && base.levelList.length) {
    levelList = applyCumulativeThresholds(
      base.levelList.map((item) => normalizeLevelItem(item, vipMax, vipMin)),
      vipMax,
      vipMin
    );
  } else if (hasLegacyShape(base)) {
    levelList = buildDefaultLevelList(vipMin, vipMax);
  } else {
    levelList = buildDefaultLevelList(vipMin, vipMax);
  }
  return {
    consumeLabel: base.consumeLabel?.trim() || defaults.consumeLabel,
    promotionRewardText: base.promotionRewardText?.trim() || defaults.promotionRewardText,
    maxLevelHint: base.maxLevelHint?.trim() || defaults.maxLevelHint,
    upgradeHintTemplate: base.upgradeHintTemplate?.trim() || defaults.upgradeHintTemplate,
    sectionTitle: base.sectionTitle?.trim() || defaults.sectionTitle,
    sectionSubtitleTemplate: base.sectionSubtitleTemplate?.trim() || defaults.sectionSubtitleTemplate,
    levelList: syncLevelListToRange(levelList, vipMin, vipMax)
  };
}
function syncLevelListToRange(prevList, vipMin, vipMax) {
  const byLevel = new Map(prevList.map((item) => [item.level, item]));
  const merged = buildDefaultLevelList(vipMin, vipMax).map((row) => {
    const existing = byLevel.get(row.level);
    return existing ? normalizeLevelItem(existing, vipMax, vipMin) : row;
  });
  return applyCumulativeThresholds(merged, vipMax, vipMin);
}
function prepareVipActivityForSave(config, vipMin, vipMax) {
  return normalizeVipActivityPayload(config, vipMin, vipMax);
}
function patchLevelActivity(list, level, patch, vipMax = VIP_MAX, vipMin = VIP_MIN) {
  const next = list.map(
    (row) => row.level === level ? normalizeLevelItem(
      { ...row, ...patch, privilegeRows: patch.privilegeRows ?? row.privilegeRows },
      vipMax,
      vipMin
    ) : row
  );
  return applyCumulativeThresholds(next, vipMax, vipMin);
}
function patchLevelPrivilege(list, level, privilegeId, patch) {
  return list.map((row) => {
    if (row.level !== level) return row;
    return {
      ...row,
      privilegeRows: row.privilegeRows.map(
        (item) => item.id === privilegeId ? { ...item, ...patch } : item
      )
    };
  });
}
function resolveVipLevelFromTotalConsume(totalConsume, levelList, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  const amount = Math.max(0, Number(totalConsume) || 0);
  let resolved = vipMin;
  const sorted = [...levelList || []].sort((a, b) => a.level - b.level);
  for (const row of sorted) {
    if (row.level < vipMin || row.level > vipMax) continue;
    const threshold = row.cumulativeThreshold != null ? Math.max(0, Number(row.cumulativeThreshold) || 0) : getDefaultCumulativeThreshold(row.level, vipMin, vipMax);
    if (amount >= threshold) {
      resolved = row.level;
    }
  }
  return resolved;
}

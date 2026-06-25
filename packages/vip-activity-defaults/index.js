/**
 * VIP 活动默认数据与归一化（Admin / 小程序 mock / seed 单一数据源）
 *
 * 运行时配置来自 CMS slug `vip-activity`；本模块仅提供缺省值与 payload 整理。
 */

/** @typedef {{ id: string, name: string, value: string, unlocked: boolean }} VipPrivilegeRow */
/** @typedef {{ level: number, cumulativeThreshold: number, upgradeTarget: number, privilegeRows: VipPrivilegeRow[] }} VipLevelActivityItem */
/** @typedef {{ consumeLabel: string, promotionRewardText: string, maxLevelHint: string, upgradeHintTemplate: string, sectionTitle: string, sectionSubtitleTemplate: string, levelList: VipLevelActivityItem[] }} VipActivityPayload */

const VIP_MIN = 0;
const VIP_MAX = 10;

/** 达到各等级所需的累计消费（元），下标 = 等级 */
const VIP_CUMULATIVE_THRESHOLDS = [
  0, 500, 1000, 2000, 5000, 10000, 20000, 35000, 55000, 80000, 100000,
];

const PRIVILEGE_IDS = [
  "consume_reward",
  "upgrade_reward",
  "service",
  "birthday",
  "priority",
  "discount",
];

const VIP_ACTIVITY_COPY = {
  consumeLabel: "消费金额",
  promotionRewardText: "升级等级获取更多消费奖励",
  maxLevelHint: "您已达到最高等级",
  upgradeHintTemplate: "还需{remain}元{consumeLabel}可升级至{nextTag}",
  sectionTitle: "会员特权",
  sectionSubtitleTemplate: "{levelTag} 专属特权",
};

function clampLevel(level, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  return Math.max(vipMin, Math.min(vipMax, Math.round(Number(level) || 0)));
}

function getDefaultCumulativeThreshold(level, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  const n = clampLevel(level, vipMin, vipMax);
  return VIP_CUMULATIVE_THRESHOLDS[n] ?? 0;
}

/** 本级 → 下一级的消费增量 */
function calcUpgradeTarget(level, cumulativeThreshold, nextCumulativeThreshold, vipMax = VIP_MAX) {
  if (level >= vipMax) return 0;
  return Math.max(0, nextCumulativeThreshold - cumulativeThreshold);
}

function buildPrivilegeRowsForLevel(level, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  const lv = clampLevel(level, vipMin, vipMax);
  return [
    {
      id: "consume_reward",
      name: "消费奖励",
      value: lv >= 1 ? `专享优惠券×${lv}` : "—",
      unlocked: lv >= 1,
    },
    {
      id: "upgrade_reward",
      name: "升级消费奖励",
      value: lv >= 1 ? `礼券${lv * 100}元` : "—",
      unlocked: lv >= 1,
    },
    {
      id: "service",
      name: "专属客服",
      value: lv >= 3 ? "7×24 在线" : "V3 解锁",
      unlocked: lv >= 3,
    },
    {
      id: "birthday",
      name: "生日礼金",
      value: lv >= 5 ? `${lv * 50}元` : "V5 解锁",
      unlocked: lv >= 5,
    },
    {
      id: "priority",
      name: "优先匹配打手",
      value: lv >= 7 ? "已开通" : "V7 解锁",
      unlocked: lv >= 7,
    },
    {
      id: "discount",
      name: "全场折扣",
      value: lv >= 9 ? `${(99 - lv * 0.5).toFixed(1)}折` : "V9 解锁",
      unlocked: lv >= 9,
    },
  ];
}

function resolveLevelThresholds(items, vipMin, vipMax) {
  const sorted = [...items].sort((a, b) => a.level - b.level);
  const map = new Map();
  for (const row of sorted) {
    map.set(
      row.level,
      row.cumulativeThreshold != null
        ? Math.max(0, Number(row.cumulativeThreshold) || 0)
        : getDefaultCumulativeThreshold(row.level, vipMin, vipMax),
    );
  }
  for (let level = vipMin; level <= vipMax; level += 1) {
    if (!map.has(level)) map.set(level, getDefaultCumulativeThreshold(level, vipMin, vipMax));
  }
  return map;
}

/** 根据累计门槛同步各级的 upgradeTarget */
function applyCumulativeThresholds(items, vipMax = VIP_MAX, vipMin = VIP_MIN) {
  const thresholds = resolveLevelThresholds(items, vipMin, vipMax);
  return [...items]
    .sort((a, b) => a.level - b.level)
    .map((row) => {
      const cumulativeThreshold =
        thresholds.get(row.level) ?? getDefaultCumulativeThreshold(row.level, vipMin, vipMax);
      const nextCumulative =
        row.level >= vipMax
          ? cumulativeThreshold
          : thresholds.get(row.level + 1) ??
            getDefaultCumulativeThreshold(row.level + 1, vipMin, vipMax);
      return {
        ...row,
        cumulativeThreshold,
        upgradeTarget: calcUpgradeTarget(
          row.level,
          cumulativeThreshold,
          nextCumulative,
          vipMax,
        ),
      };
    });
}

function createDefaultLevelActivity(level, vipMax = VIP_MAX, vipMin = VIP_MIN) {
  const cumulativeThreshold = getDefaultCumulativeThreshold(level, vipMin, vipMax);
  const nextCumulative = getDefaultCumulativeThreshold(
    Math.min(level + 1, vipMax),
    vipMin,
    vipMax,
  );
  return {
    level,
    cumulativeThreshold,
    upgradeTarget: calcUpgradeTarget(level, cumulativeThreshold, nextCumulative, vipMax),
    privilegeRows: buildPrivilegeRowsForLevel(level, vipMin, vipMax),
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
    levelList: buildDefaultLevelList(vipMin, vipMax),
  };
}

const VIP_ACTIVITY_DEFAULT = createDefaultPayload(VIP_MIN, VIP_MAX);

function normalizePrivilegeRow(item) {
  const id = (item?.id && String(item.id).trim()) || "privilege";
  return {
    id,
    name: (item?.name && String(item.name).trim()) || id,
    value: item?.value != null ? String(item.value).trim() : "—",
    unlocked: Boolean(item?.unlocked),
  };
}

function normalizeLevelItem(item, vipMax, vipMin) {
  const level = item.level;
  const defaults = createDefaultLevelActivity(level, vipMax, vipMin);
  const rows =
    Array.isArray(item.privilegeRows) && item.privilegeRows.length
      ? item.privilegeRows.map(normalizePrivilegeRow)
      : defaults.privilegeRows;

  const byId = new Map(rows.map((row) => [row.id, row]));
  const privilegeRows = PRIVILEGE_IDS.map(
    (id) => byId.get(id) ?? defaults.privilegeRows.find((row) => row.id === id),
  );

  const cumulativeThreshold =
    item.cumulativeThreshold != null
      ? Math.max(0, Number(item.cumulativeThreshold) || 0)
      : defaults.cumulativeThreshold;

  return {
    level,
    cumulativeThreshold,
    upgradeTarget: item.upgradeTarget != null ? Math.max(0, Number(item.upgradeTarget) || 0) : 0,
    privilegeRows,
  };
}

function hasLegacyShape(payload) {
  return Boolean(payload?.levelRules || payload?.privilegeDefs);
}

/**
 * 整理 CMS / 本地编辑态 payload：补齐等级行、特权顺序与 upgradeTarget。
 * @param {Partial<VipActivityPayload> | null | undefined} payload
 * @param {number} [vipMin]
 * @param {number} [vipMax]
 * @returns {VipActivityPayload}
 */
function normalizeVipActivityPayload(payload, vipMin = VIP_MIN, vipMax = VIP_MAX) {
  const base = payload && typeof payload === "object" ? payload : VIP_ACTIVITY_DEFAULT;
  const defaults = createDefaultPayload(vipMin, vipMax);

  let levelList;
  if (Array.isArray(base.levelList) && base.levelList.length) {
    levelList = applyCumulativeThresholds(
      base.levelList.map((item) => normalizeLevelItem(item, vipMax, vipMin)),
      vipMax,
      vipMin,
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
    sectionSubtitleTemplate:
      base.sectionSubtitleTemplate?.trim() || defaults.sectionSubtitleTemplate,
    levelList: syncLevelListToRange(levelList, vipMin, vipMax),
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
  const next = list.map((row) =>
    row.level === level
      ? normalizeLevelItem(
          { ...row, ...patch, privilegeRows: patch.privilegeRows ?? row.privilegeRows },
          vipMax,
          vipMin,
        )
      : row,
  );
  return applyCumulativeThresholds(next, vipMax, vipMin);
}

function patchLevelPrivilege(list, level, privilegeId, patch) {
  return list.map((row) => {
    if (row.level !== level) return row;
    return {
      ...row,
      privilegeRows: row.privilegeRows.map((item) =>
        item.id === privilegeId ? { ...item, ...patch } : item,
      ),
    };
  });
}

/** 根据累计消费解析 VIP 等级（门槛来自 CMS levelList） */
function resolveVipLevelFromTotalConsume(
  totalConsume,
  levelList,
  vipMin = VIP_MIN,
  vipMax = VIP_MAX,
) {
  const amount = Math.max(0, Number(totalConsume) || 0);
  let resolved = vipMin;
  const sorted = [...(levelList || [])].sort((a, b) => a.level - b.level);
  for (const row of sorted) {
    if (row.level < vipMin || row.level > vipMax) continue;
    const threshold =
      row.cumulativeThreshold != null
        ? Math.max(0, Number(row.cumulativeThreshold) || 0)
        : getDefaultCumulativeThreshold(row.level, vipMin, vipMax);
    if (amount >= threshold) {
      resolved = row.level;
    }
  }
  return resolved;
}

export {
  VIP_MIN,
  VIP_MAX,
  VIP_CUMULATIVE_THRESHOLDS,
  PRIVILEGE_IDS,
  VIP_ACTIVITY_COPY,
  VIP_ACTIVITY_DEFAULT,
  createDefaultPayload,
  getDefaultCumulativeThreshold,
  calcUpgradeTarget,
  buildPrivilegeRowsForLevel,
  applyCumulativeThresholds,
  createDefaultLevelActivity,
  buildDefaultLevelList,
  normalizeVipActivityPayload,
  syncLevelListToRange,
  prepareVipActivityForSave,
  patchLevelActivity,
  patchLevelPrivilege,
  resolveVipLevelFromTotalConsume,
};

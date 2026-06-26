/**
 * 注册活动默认数据与归一化（Admin / seed 单一数据源）
 *
 * 运行时配置来自 CMS slug `register-activity`。
 */

/** @typedef {{ enabled: boolean, title: string, subtitle: string, templateIds: string[] }} RegisterActivityPayload */

const REGISTER_ACTIVITY_DEFAULTS = {
  enabled: true,
  title: "新人注册有礼",
  subtitle: "注册成功后自动发放优惠券，首单即可使用",
  templateIds: ["cp_welcome"],
};

function normalizeTemplateIds(ids) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map((item) => String(item).trim()).filter(Boolean))];
}

/**
 * @param {Partial<RegisterActivityPayload> | null | undefined} raw
 * @returns {RegisterActivityPayload}
 */
function normalizeRegisterActivityPayload(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const templateIds = normalizeTemplateIds(input.templateIds);

  return {
    enabled: input.enabled !== false,
    title: input.title?.trim() || REGISTER_ACTIVITY_DEFAULTS.title,
    subtitle: input.subtitle?.trim() || REGISTER_ACTIVITY_DEFAULTS.subtitle,
    templateIds: templateIds.length ? templateIds : [...REGISTER_ACTIVITY_DEFAULTS.templateIds],
  };
}

export { REGISTER_ACTIVITY_DEFAULTS, normalizeRegisterActivityPayload };

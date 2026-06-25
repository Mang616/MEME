/**
 * 与 packages/invite-activity-defaults/index.js 同步，运行 npm run miniprogram:sync-invite-activity 更新。
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

// packages/invite-activity-defaults/index.js
var index_exports = {};
__export(index_exports, {
  INVITE_ACTIVITY_DEFAULTS: () => INVITE_ACTIVITY_DEFAULTS,
  normalizeInviteActivityPayload: () => normalizeInviteActivityPayload,
  toInviteBannerPayload: () => toInviteBannerPayload
});
module.exports = __toCommonJS(index_exports);
var INVITE_ACTIVITY_DEFAULTS = {
  enabled: true,
  tag: "\u9650\u65F6\u6D3B\u52A8",
  title: "\u9080\u8BF7\u597D\u53CB \xB7 \u9886\u53D6\u5956\u52B1",
  subtitle: "\u597D\u53CB\u5B8C\u6210\u9996\u5355\uFF0C\u53CC\u65B9\u5747\u53EF\u83B7\u5F97\u4F18\u60E0\u5238",
  cta: "\u53BB\u9080\u8BF7",
  navTag: "\u9080\u8BF7",
  navTitle: "\u9080\u8BF7\u597D\u53CB\u6709\u793C",
  rules: [
    "\u5206\u4EAB\u9080\u8BF7\u7801\u6216\u4E8C\u7EF4\u7801\u7ED9\u597D\u53CB",
    "\u597D\u53CB\u901A\u8FC7\u94FE\u63A5\u8FDB\u5165\u5C0F\u7A0B\u5E8F\u5E76\u5B8C\u6210\u6CE8\u518C",
    "\u597D\u53CB\u5B8C\u6210\u9996\u5355\u540E\uFF0C\u53CC\u65B9\u5404\u5F97\u4F18\u60E0\u5238\u5956\u52B1"
  ],
  poster: {
    headline: "\u9080\u8BF7\u597D\u53CB \xB7 \u9886\u53D6\u5956\u52B1",
    footnote: "\u626B\u7801\u6216\u8F93\u5165\u9080\u8BF7\u7801\uFF0C\u4E00\u8D77\u9886\u4F18\u60E0\u5238"
  }
};
function normalizeRules(rules) {
  if (!Array.isArray(rules) || !rules.length) {
    return [...INVITE_ACTIVITY_DEFAULTS.rules];
  }
  return rules.map((item) => String(item).trim()).filter(Boolean);
}
function normalizeInviteActivityPayload(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const title = input.title?.trim() || INVITE_ACTIVITY_DEFAULTS.title;
  return {
    enabled: input.enabled !== false,
    tag: input.tag?.trim() || INVITE_ACTIVITY_DEFAULTS.tag,
    title,
    subtitle: input.subtitle?.trim() || INVITE_ACTIVITY_DEFAULTS.subtitle,
    cta: input.cta?.trim() || INVITE_ACTIVITY_DEFAULTS.cta,
    navTag: input.navTag?.trim() || INVITE_ACTIVITY_DEFAULTS.navTag,
    navTitle: input.navTitle?.trim() || INVITE_ACTIVITY_DEFAULTS.navTitle,
    rules: normalizeRules(input.rules),
    poster: {
      headline: input.poster?.headline?.trim() || title || INVITE_ACTIVITY_DEFAULTS.poster.headline,
      footnote: input.poster?.footnote?.trim() || INVITE_ACTIVITY_DEFAULTS.poster.footnote
    }
  };
}
function toInviteBannerPayload(raw) {
  const activity = normalizeInviteActivityPayload(raw);
  return {
    tag: activity.tag,
    title: activity.title,
    subtitle: activity.subtitle,
    cta: activity.cta,
    navTag: activity.navTag,
    navTitle: activity.navTitle,
    rules: activity.rules
  };
}

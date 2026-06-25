/**
 * 从小程序 mock 导出种子数据
 * 运行: node apps/server/scripts/build-seed-from-mocks.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../../..");
const mockDir = path.join(root, "apps/miniprogram/utils/mock");
const cache = new Map();

function loadMockByPath(filePath) {
  const key = path.resolve(filePath);
  if (cache.has(key)) return cache.get(key);
  const src = fs.readFileSync(key, "utf8");
  const localRequire = (rel) => {
    const resolved = path.resolve(path.dirname(key), rel);
    const withExt = resolved.endsWith(".js") ? resolved : `${resolved}.js`;
    return loadMockByPath(withExt);
  };
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function("module", "exports", "require", "__dirname", "__filename", src)(
    module,
    module.exports,
    localRequire,
    path.dirname(key),
    key,
  );
  cache.set(key, module.exports);
  return module.exports;
}

function loadMock(name) {
  return loadMockByPath(path.join(mockDir, name));
}

const req = loadMock;

const { REVIEWS_BY_PRODUCT } = req("product-reviews.js");
const { INTRO_SECTIONS, DEFAULT_INTRO } = req("product-intros.js");
const { GUIDES } = req("guides.js");
const legal = req("legal.js");
const minorGuide = req("minor-guide.js");
const { INVITE_BANNER } = req("invite-banner.js");
const { INVITE_ACTIVITY } = req("invite-activity.js");
const feedback = req("feedback.js");
const { QUICK_ENTRIES } = req("quick-entries.js");
const vipLevels = req("vip-levels.js");
const vipActivity = req("vip-activity.js");
const { COUPON_DEFAULTS } = req("coupons.js");
const chats = req("chats.js");

const DEFAULT_USERS = [
  {
    id: "u1",
    nickname: "麦当劳到了",
    phone: "13800138001",
    avatar: "/assets/profile/boys.webp",
    vipLevel: 3,
    balance: 128.5,
    totalConsume: 2500,
    status: "active",
    registeredAt: "2026-01-10 12:00:00",
    lastLoginAt: "2026-05-24 15:30:00",
  },
  {
    id: "u2",
    nickname: "玩家A",
    phone: "13800138002",
    avatar: "/assets/profile/boys.webp",
    vipLevel: 1,
    balance: 0,
    totalConsume: 500,
    status: "active",
    registeredAt: "2026-02-15 09:00:00",
    lastLoginAt: "2026-05-23 09:00:00",
  },
  {
    id: "u3",
    nickname: "老玩家88",
    phone: "13800138003",
    avatar: "/assets/profile/girls.webp",
    vipLevel: 5,
    balance: 520,
    totalConsume: 10000,
    status: "active",
    registeredAt: "2025-12-01 18:00:00",
    lastLoginAt: "2026-05-20 18:00:00",
  },
  {
    id: "u4",
    nickname: "萌新001",
    phone: "13800138004",
    avatar: "/assets/profile/boys.webp",
    vipLevel: 0,
    balance: 0,
    totalConsume: 0,
    status: "disabled",
    registeredAt: "2026-05-01 10:00:00",
    lastLoginAt: "2026-05-18 10:30:00",
  },
];

const DEFAULT_BANNERS = [
  {
    id: "b1",
    title: "迷因电竞",
    subtitle: "三角洲护航 · 专业车队",
    image: "",
    bgColor: "#2d4a35",
    linkType: "products",
    linkValue: "escort",
    sortOrder: 1,
    published: true,
  },
  {
    id: "b2",
    title: "五一活动",
    subtitle: "限时特惠 · 点击查看",
    image: "",
    bgColor: "#3d5240",
    linkType: "tab",
    linkValue: "/pages/products/index",
    sortOrder: 2,
    published: true,
  },
  {
    id: "b3",
    title: "陪玩上车",
    subtitle: "高分选手 · 语音开黑",
    image: "",
    bgColor: "#354840",
    linkType: "products",
    linkValue: "companion",
    sortOrder: 3,
    published: true,
  },
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "合规提示",
    content: "未成年人禁止下单",
    placement: "home_bar",
    enabled: true,
    sortOrder: 1,
    startAt: "",
    endAt: "",
  },
];

const productReviews = [];
let sortOrder = 0;
for (const [productId, reviews] of Object.entries(REVIEWS_BY_PRODUCT)) {
  for (const r of reviews) {
    productReviews.push({
      id: r.id,
      productId,
      userName: r.user,
      rate: r.rate,
      content: r.content,
      reviewTime: r.time,
      sortOrder: sortOrder++,
    });
  }
}

const conversations = chats.listConversations().map((c, i) => ({
  ...c,
  sortOrder: i,
}));

const chatMessages = [];
for (const conv of conversations) {
  for (const m of chats.getMessages(conv.id)) {
    chatMessages.push({ ...m, conversationId: conv.id });
  }
}

const contentPages = [
  { id: "cp-guides", slug: "guides", title: "帮助说明", payload: GUIDES },
  {
    id: "cp-agreement",
    slug: "agreement",
    title: "用户协议",
    payload: legal.getLegalDoc("agreement"),
  },
  {
    id: "cp-privacy",
    slug: "privacy",
    title: "隐私政策",
    payload: legal.getLegalDoc("privacy"),
  },
  {
    id: "cp-minor-guide",
    slug: "minor-guide",
    title: "未成年人指引",
    payload: minorGuide.getMinorGuide(),
  },
  { id: "cp-invite", slug: "invite-banner", title: "邀请有礼", payload: INVITE_BANNER },
  { id: "cp-invite-activity", slug: "invite-activity", title: "邀请活动", payload: INVITE_ACTIVITY },
  {
    id: "cp-feedback",
    slug: "feedback-config",
    title: "意见反馈配置",
    payload: {
      types: feedback.FEEDBACK_TYPES,
      contentMin: feedback.CONTENT_MIN,
      contentMax: feedback.CONTENT_MAX,
    },
  },
  {
    id: "cp-quick",
    slug: "quick-entries",
    title: "帮助入口",
    payload: { entries: QUICK_ENTRIES },
  },
  {
    id: "cp-vip",
    slug: "vip-config",
    title: "VIP 配置",
    payload: {
      vipMin: vipLevels.VIP_MIN,
      vipMax: vipLevels.VIP_MAX,
      levelList: vipLevels.VIP_LEVEL_LIST,
    },
  },
  {
    id: "cp-vip-activity",
    slug: "vip-activity",
    title: "VIP 活动",
    payload: vipActivity.VIP_ACTIVITY_DEFAULT,
  },
  {
    id: "cp-coupons",
    slug: "coupons",
    title: "优惠券",
    payload: COUPON_DEFAULTS,
  },
  {
    id: "cp-product-intros",
    slug: "product-intros",
    title: "商品玩法介绍",
    payload: { sections: INTRO_SECTIONS, defaultIntro: DEFAULT_INTRO },
  },
];

const extras = {
  users: DEFAULT_USERS,
  banners: DEFAULT_BANNERS,
  announcements: DEFAULT_ANNOUNCEMENTS,
  contentPages,
  productReviews,
  chatConversations: conversations,
  chatMessages,
};

const outPath = path.join(root, "apps/server/seed/extras.json");
fs.writeFileSync(outPath, JSON.stringify(extras, null, 2) + "\n", "utf8");
console.log("Wrote", outPath);

const initialPath = path.join(root, "apps/server/seed/initial.json");
const initial = JSON.parse(fs.readFileSync(initialPath, "utf8"));
fs.writeFileSync(initialPath, JSON.stringify({ ...initial, ...extras }, null, 2) + "\n", "utf8");
console.log("Merged into", initialPath);

import { ORDER_WEB_URL, ROUTES, ASSETS } from "@/lib/site";

export type FaqItem = {
  question: string;
  answer: string;
};

export type LinkAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
};

export type ServiceCard = {
  title: string;
  badge: string;
  description: string;
  image?: string;
};

export type EntryLinkItem = {
  title: string;
  label: string;
  description: string;
  href: string;
};

export const SITE_COPY = {
  tagline: "陪你玩",
  heroLead: "想玩就来。有人陪你开麦、组队、上车。",
  metaDescription:
    "迷因电竞 MEME：陪你玩、陪你聊、陪你组队。网站下单、下载客户端、微信小程序。",
  orgDescription: "陪你玩、陪你聊、陪你上车。",
  webSiteDescription: "迷因电竞，陪你玩。在线下单、下载客户端、微信小程序。",
  footerLead: "网站下单、下载到手机和电脑、微信小程序。",
  ctaTitle: "别一个人玩",
  ctaDescription: "选好方式，马上开玩。",
  aboutTitle: "关于我们",
  aboutLead: "迷因电竞 MEME，陪你玩、陪你聊、陪你组队。",
  aboutBody: "开麦、组队、一起打。想玩就来，别一个人闷着。",
  orderTitle: "去下单",
  orderLead: "点「打开下单网站」进下单页。下载应用或走微信小程序，下次更快。",
  orderInstallTitle: "下载应用",
  orderInstallNote: "装到手机或电脑，下次打开就能下单。",
  orderWechatTitle: "微信小程序",
  orderWechatNote: "习惯用微信，搜迷因电竞或扫码进入。",
  orderCtaTitle: "准备好了？",
  orderCtaDescription: "打开下单网站，开始选人。",
} as const;

export const COMPLIANCE_MESSAGE = "未成年人禁止下单。";

const orderPageAction: LinkAction = { href: ROUTES.order, label: "去下单" };
const openOrderWebAction: LinkAction = { href: ORDER_WEB_URL, label: "打开下单网站" };
const homeAction: LinkAction = { href: ROUTES.home, label: "返回首页", variant: "secondary" };

export const HOME_HERO_ACTIONS: LinkAction[] = [orderPageAction];
export const ORDER_PAGE_ACTIONS: LinkAction[] = [openOrderWebAction, homeAction];
export const HOME_CTA_ACTIONS: LinkAction[] = [orderPageAction];
export const ORDER_CTA_ACTIONS: LinkAction[] = [openOrderWebAction];

export const HOME_FEATURES = [
  { title: "叫人", description: "你说想玩" },
  { title: "排队", description: "我们安排" },
  { title: "开麦", description: "一起上车" },
  { title: "开玩", description: "别一个人闷着" },
] as const;

export const ORDER_FEATURES = [
  { title: "网站", description: "打开就下" },
  { title: "应用", description: "装过更快" },
  { title: "微信", description: "扫码下单" },
  { title: "开玩", description: "等人联系" },
] as const;

export const HOME_SERVICES: ServiceCard[] = [
  {
    title: "陪你玩",
    badge: "PLAY",
    image: ASSETS.huhang,
    description: "想玩就来，别自己排。",
  },
  {
    title: "陪你聊",
    badge: "CHAT",
    image: ASSETS.peiwan,
    description: "开麦、组队、有人接话。",
  },
  {
    title: "陪你冲",
    badge: "GO",
    description: "你说怎么玩，我们陪你打。",
  },
];

/** 三种下单方式（下单页主入口） */
export const ORDER_WAYS: EntryLinkItem[] = [
  {
    title: "网站下单",
    label: "01",
    href: ORDER_WEB_URL,
    description: "浏览器打开，直接选服务。",
  },
  {
    title: "下载应用",
    label: "02",
    href: `${ROUTES.order}#install`,
    description: "装到手机或电脑。",
  },
  {
    title: "微信小程序",
    label: "03",
    href: `${ROUTES.order}#wechat`,
    description: "微信里搜迷因电竞。",
  },
];

/** 各端安装入口（#install 区块） */
export const DOWNLOAD_OPTIONS: EntryLinkItem[] = [
  {
    title: "安卓手机",
    label: "Android",
    href: ORDER_WEB_URL,
    description: "浏览器打开下单站，按提示装到桌面。",
  },
  {
    title: "iPhone",
    label: "iOS",
    href: ORDER_WEB_URL,
    description: "Safari 打开下单站，添加到主屏幕。",
  },
  {
    title: "电脑端",
    label: "PC",
    href: ORDER_WEB_URL,
    description: "Chrome 或 Edge 打开，安装成桌面应用。",
  },
];

export const HOME_FAQ: FaqItem[] = [
  {
    question: "怎么下单？",
    answer: "点击「去下单」，打开下单网站；或下载应用、用微信小程序，选你方便的方式。",
  },
  {
    question: "可以指定时间吗？",
    answer: "可以。下单时把时间写清楚。",
  },
  {
    question: "有年龄限制吗？",
    answer: COMPLIANCE_MESSAGE,
  },
];

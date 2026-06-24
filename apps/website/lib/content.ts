import { ASSETS, ORDER_SITE_URL } from "@/lib/site";

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

export const HOME_FEATURES = [
  { title: "叫人", description: "你说想玩" },
  { title: "排队", description: "我们安排" },
  { title: "开麦", description: "一起上车" },
  { title: "开玩", description: "别一个人闷着" },
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

export const ORDER_CHANNELS: EntryLinkItem[] = [
  {
    title: "网站下单",
    label: "01",
    href: ORDER_SITE_URL,
    description: "打开链接，直接选。",
  },
  {
    title: "下载方式",
    label: "02",
    href: "/download",
    description: "安卓、iOS、电脑都能用。",
  },
  {
    title: "小程序下单",
    label: "03",
    href: "/mini-program",
    description: "微信里搜，微信里点。",
  },
];

export const DOWNLOAD_OPTIONS: EntryLinkItem[] = [
  {
    title: "安卓手机",
    label: "Android",
    href: ORDER_SITE_URL,
    description: "打开下单网站，按提示安装到桌面。",
  },
  {
    title: "iPhone",
    label: "iOS",
    href: ORDER_SITE_URL,
    description: "用 Safari 打开，添加到主屏幕。",
  },
  {
    title: "电脑端",
    label: "PC",
    href: ORDER_SITE_URL,
    description: "用 Chrome 或 Edge 打开，安装成桌面应用。",
  },
  {
    title: "微信小程序",
    label: "WeChat",
    href: "/mini-program",
    description: "微信里打开，微信里下单。",
  },
];

export const HOME_FAQ: FaqItem[] = [
  {
    question: "怎么下单？",
    answer: "打开下单网站，或者进微信小程序。",
  },
  {
    question: "你们是做什么的？",
    answer: "陪你玩。开麦、组队、一起打。",
  },
  {
    question: "可以指定时间吗？",
    answer: "可以。下单时把时间写清楚。",
  },
  {
    question: "有年龄限制吗？",
    answer: "未成年人禁止下单。",
  },
];

export const DOWNLOAD_STEPS = [
  "打开下单网站。",
  "按你的设备选择安装方式。",
  "桌面出现迷因电竞图标。",
  "下次直接打开。",
] as const;

export const MINI_PROGRAM_STEPS = [
  "打开微信，点击右上角扫一扫。",
  "扫码，或搜索迷因电竞。",
  "进去以后直接下单。",
  "习惯微信就走小程序。",
] as const;

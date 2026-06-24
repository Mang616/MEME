/** 官网文案与页面组件共享类型 */

export type FaqItem = {
  question: string;
  answer: string;
};

export type LinkAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
};

export type ServiceCardData = {
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

export type FeatureItem = {
  title: string;
  description: string;
};

export type RoadmapPhase = {
  phase: string;
  title: string;
  description: string;
  icon?: string;
};

export type MemeHeroCopy = {
  eyebrow: string;
  titleTop: string;
  titleAccent: string;
  titleCn: string;
  lead: string;
};

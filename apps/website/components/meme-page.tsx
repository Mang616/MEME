import type { ReactNode } from "react";
import { PageSection } from "@/components/page-section";

type MemePageProps = {
  children: ReactNode;
};

type MemeSectionProps = {
  id?: string;
  className?: string;
  tight?: boolean;
  children: ReactNode;
};

/** Meme 风格页面根容器 */
export function MemePage({ children }: MemePageProps) {
  return <main className="meme-landing-page">{children}</main>;
}

/** 带 meme 区块样式的 section，避免重复 className 拼接 */
export function MemeSection({ id, className, tight, children }: MemeSectionProps) {
  const classes = ["section", "meme-section", tight ? "section-tight" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <PageSection id={id} className={classes}>
      {children}
    </PageSection>
  );
}

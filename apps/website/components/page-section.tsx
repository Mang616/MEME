import type { ReactNode } from "react";

type PageSectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export function PageSection({ id, className = "section", children }: PageSectionProps) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}

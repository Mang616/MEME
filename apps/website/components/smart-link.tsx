import Link from "next/link";
import type { ReactNode } from "react";
import { isExternalHref } from "@/lib/site";

type SmartLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** 站内 Link / 站外 <a> 统一入口，避免重复判断 */
export function SmartLink({ href, className, children }: SmartLinkProps) {
  if (isExternalHref(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

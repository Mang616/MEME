import Link from "next/link";
import { ComplianceNotice } from "@/components/compliance-notice";
import { SITE_COPY } from "@/lib/content";
import { ROUTES, SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div>
        <strong>{SITE_NAME}</strong>
        <p>{SITE_COPY.footerLead}</p>
        <ComplianceNotice />
      </div>
      <Link className="btn btn-primary" href={ROUTES.order}>
        去下单
      </Link>
    </footer>
  );
}

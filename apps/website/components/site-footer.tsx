import Link from "next/link";
import { ORDER_SITE_URL, SITE_NAME } from "@/lib/site";

export function SiteFooter({ ctaHref = ORDER_SITE_URL, ctaLabel = "去下单" }: { ctaHref?: string; ctaLabel?: string }) {
  return (
    <footer className="footer">
      <div>
        <strong>{SITE_NAME}</strong>
        <p>陪你玩。网站下单、下载安装到手机和电脑、微信小程序。未成年人禁止下单。</p>
      </div>
      <Link className="btn btn-primary" href={ctaHref}>{ctaLabel}</Link>
    </footer>
  );
}

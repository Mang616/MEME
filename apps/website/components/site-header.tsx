"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/components/theme-provider";
import { themeToggleIcon, themeToggleLabel } from "@/lib/theme";
import { ASSETS, ROUTES, SITE_NAME_SHORT } from "@/lib/site";

const NAV_LINKS = [
  { href: ROUTES.home, label: "首页" },
  { href: ROUTES.about, label: "关于我们" },
] as const;

export function SiteHeader() {
  const { mode, cycleMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="nav" aria-label="主导航">
      <div className="nav-inner">
        <Link className="brand" href={ROUTES.home}>
          <Image className="brand-logo" src={ASSETS.logo} alt="" width={36} height={36} priority />
          <span>{SITE_NAME_SHORT}</span>
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label="打开导航菜单"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
        </button>

        <nav
          className={`nav-links${menuOpen ? " is-open" : ""}`}
          id="site-nav"
          aria-label="官网导航"
          onClick={() => setMenuOpen(false)}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
          <Link className="nav-cta-mobile btn btn-primary btn-sm" href={ROUTES.order}>
            去下单
          </Link>
        </nav>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={themeToggleLabel(mode)}
            title={themeToggleLabel(mode)}
            onClick={cycleMode}
          >
            {themeToggleIcon(mode)}
          </button>
          <Link className="btn btn-primary btn-sm nav-cta-desktop" href={ROUTES.order}>
            去下单
          </Link>
        </div>
      </div>
    </header>
  );
}

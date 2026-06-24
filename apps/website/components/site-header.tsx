"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { SITE_NAV_LINKS } from "@/lib/navigation";
import { ASSETS, ROUTES, SITE_NAME_SHORT } from "@/lib/site";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="meme-nav" aria-label="主导航">
      <div className="meme-nav-inner">
        <button
          className="meme-nav-menu"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label="打开导航菜单"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="meme-nav-menu-icon" aria-hidden="true" />
          <span className="meme-nav-menu-label">MENU</span>
        </button>

        <Link className="meme-nav-brand" href={ROUTES.home} onClick={closeMenu}>
          <Image className="meme-nav-logo" src={ASSETS.logo} alt="" width={40} height={40} priority />
          <span>{SITE_NAME_SHORT}</span>
        </Link>

        <div className="meme-nav-actions">
          <ThemeToggleButton />
          <Link className="btn btn-meme-pill" href={ROUTES.order}>
            去下单
          </Link>
        </div>
      </div>

      <nav
        className={`meme-nav-drawer${menuOpen ? " is-open" : ""}`}
        id="site-nav"
        aria-label="官网导航"
        onClick={closeMenu}
      >
        {SITE_NAV_LINKS.map(({ href, label }) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
        <Link className="btn btn-meme-pill" href={ROUTES.order}>
          去下单
        </Link>
      </nav>
    </header>
  );
}

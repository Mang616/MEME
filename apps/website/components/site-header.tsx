"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ASSETS, ORDER_SITE_URL, SITE_NAME_SHORT } from "@/lib/site";

const LINKS = [
  { href: "/#services", label: "怎么玩" },
  { href: "/download", label: "下载" },
  { href: "/mini-program", label: "小程序" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = document.documentElement.getAttribute("data-theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("meme-theme", next);
    setTheme(next);
  };

  return (
    <header className="nav" aria-label="主导航">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <Image className="brand-logo" src={ASSETS.logo} alt="" width={36} height={36} priority />
          <span>{SITE_NAME_SHORT}</span>
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label="打开导航菜单"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
        </button>

        <nav
          className={`nav-links${menuOpen ? " is-open" : ""}`}
          id="site-nav"
          aria-label="官网导航"
          onClick={() => setMenuOpen(false)}
        >
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
          <Link className="nav-cta-mobile btn btn-primary btn-sm" href={ORDER_SITE_URL}>网站下单</Link>
        </nav>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === "dark" ? "切换浅色模式" : "切换深色模式"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
          <Link className="btn btn-primary btn-sm nav-cta-desktop" href={ORDER_SITE_URL}>网站下单</Link>
        </div>
      </div>
    </header>
  );
}

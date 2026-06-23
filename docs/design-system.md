# MEME Design System

The mini program is the visual source of truth for MEME. Website, PWA client, admin, and future desktop surfaces should inherit its palette, spacing language, price badges, and light/dark behavior instead of inventing a separate web style.

## Source Of Truth

- Canonical mini program tokens: `apps/miniprogram/miniapp/styles/theme/tokens.wxss`
- Mini program theme runtime: `apps/miniprogram/miniapp/utils/theme.js`
- Mini program token audit: `apps/miniprogram/miniapp/docs/DESIGN_TOKENS.md`
- Shared web aliases: `packages/theme/tokens.css`

If a color or typography rule conflicts, the mini program files win.

## Core Palette

| Role | Token | Value |
| --- | --- | --- |
| Dark background | `--color-bg` | `#000000` |
| Light background | `--color-bg` | `#ffffff` |
| Brand mint / primary | `--color-mint`, `--color-primary` | `#d1ffbd` |
| Mint strong | `--color-mint-strong` | `#9ed482` |
| Mint deep | `--color-mint-deep` | `#6db85a` |
| Accent red | `--color-accent` | `#ff3b30` |
| Dark card | `--color-card` | `#141414` |
| Light card | `--color-card` | `#f7f8f7` |
| Dark service surface | `--color-service-surface` | `#1a1d1c` |
| Light service surface | `--color-service-surface` | `#dfffd6` |

## Usage Rules

- Use mint for primary actions, selected states, links, recommended tags, and banner titles.
- Use red only for the price badge background and urgent/new tags.
- Keep price badges as red background with black italic display text.
- Keep dark mode default.
- Light mode should use white page background and the mini program's pale green service surfaces.
- Do not expose SEO, backend, PWA, or implementation language in user-facing copy.
- Do not add new hard-coded hex colors in website/admin/client CSS unless they are first added to the mini program token source.

## Web Mapping

`packages/theme/tokens.css` mirrors the mini program values and keeps old `--meme-*` aliases temporarily. New website/admin/client code should use `--color-*` tokens first.

Legacy aliases currently map as follows:

| Legacy | Canonical |
| --- | --- |
| `--meme-lime` | `--color-mint` |
| `--meme-green` | `--color-mint-deep` |
| `--meme-red` | `--color-accent` |
| `--meme-card-dark` | `#1a1d1c` |

## Mini Program Quality Notes

The migrated mini program currently totals about 3 MB of local files. WeChat DevTools reports main package size pressure and image/audio package warnings. No single checked asset exceeded 200 KB, but several visual assets are large enough to optimize later:

- `assets/profile/girls.png` around 150 KB
- `assets/level/bg.png` around 148 KB
- `assets/profile/bag.png` around 143 KB
- `assets/profile/boys.png` around 140 KB
- `assets/fonts/price-italic.ttf` around 113 KB
- `assets/home/huhang.png` around 104 KB

Later optimization should compress PNGs, consider WebP where supported, move large non-critical assets into subpackages or CDN, and keep the skipped price font behavior unless a smaller HTTPS-hosted subset font is available.

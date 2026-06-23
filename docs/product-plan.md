# MEME Product Plan

## Modules

- Website: SEO-first brand website for Delta Force escort and meme esports services.
- Client: PWA ordering client with light/dark modes and mini-program style interactions.
- Admin: operations dashboard for services, packages, orders, banners, and SEO content.
- Mini program: migrated into `apps/miniprogram/miniapp` and now acts as the visual source of truth.

## First Milestone

- Establish visual system from the migrated mini program: primary mint `#d1ffbd`, accent red `#ff3b30`, black/white modes, red price stickers, service-panel surfaces, and meme-esports visual assets.
- Launch a crawlable website home page and a Delta Force SEO page.
- Launch a PWA shell that can later become the ordering client.
- Launch an admin shell for product, order, banner, and article operations.

## SEO Targets

- 三角洲行动护航
- 三角洲护航车队
- 三角洲行动陪玩
- 三角洲老板单
- 迷因电竞

## Design Source

All color and component styling decisions should follow the mini program first:

- Canonical tokens: `apps/miniprogram/miniapp/styles/theme/tokens.wxss`
- Theme behavior: `apps/miniprogram/miniapp/utils/theme.js`
- External design summary: `docs/design-system.md`
- Web shared tokens: `packages/theme/tokens.css`

Website/admin/client user-facing copy must not mention SEO strategy, backend configuration, PWA implementation details, or other internal project language.

## Next Decisions

- Real order flow: online payment or customer-service confirmation.
- Login method: phone, WeChat, account password, or mixed.
- Data backend: start with API mock data, then add database and admin auth.

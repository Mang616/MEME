# MEME

MEME is a meme-styled esports ordering platform for Delta Force escort services, promotions, and operations.

## Workspace

```text
apps/
  website/      SEO website and brand entry
  client/       PWA ordering client
  admin/        Operations dashboard
  miniprogram/  Migrated WeChat mini program
packages/
  theme/        Shared color tokens and visual system
docs/           Product and SEO planning
scripts/        Local static server and checks
```

## Local Preview

```bash
npm run dev
```

Open:

- Website: http://localhost:4173/
- Delta Force SEO page: http://localhost:4173/delta-force
- PWA client: http://localhost:4173/client
- Admin: http://localhost:4173/admin

## Product Direction

The mini program is the visual source of truth. Web surfaces should follow its black/white modes, primary mint `#d1ffbd`, accent red `#ff3b30`, deep service surfaces, red price stickers, and meme-esports imagery. See `docs/design-system.md`.

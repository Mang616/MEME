# MEME Product Plan

## Modules

| Module | Path | Status |
|--------|------|--------|
| Website | `apps/website` | Live — brand landing, Pepe meme style |
| Mini program | `apps/miniprogram` | Live — visual source of truth, core order flow |
| API | `apps/server` | Live — products, orders, handlers, admin auth |
| Admin | `apps/admin` | Live — orders / products / handlers CRUD |
| Client | `apps/client` | Placeholder — future PWA / desktop |

## Milestones

### Done

- Mini program UI: home, catalog, order create, order list, profile, chat shell.
- Unified API with JSON persistence; admin dashboard wired to same data.
- Mini program business data migrated from local mock to `utils/api/`.
- Website meme landing; shared mint `#d1ffbd` / accent `#ff3b30` tokens on web.

### Next

- Mini program: chat, auth, VIP, banners → API (or CMS in admin).
- Real payment and WeChat login (replace `auth-api.js` mock).
- Database (replace `db.json`); pagination and user-scoped orders.
- Client PWA shell.

## Design Source

Mini program first. See `docs/design-system.md` and `packages/theme/tokens.css`.

User-facing copy must not mention SEO strategy, backend internals, or implementation jargon.

## Open Decisions

- Payment: online vs customer-service confirmation.
- Login: phone + WeChat mix (current mock uses SMS code `123456`).
- Order visibility: filter by logged-in user on public API.

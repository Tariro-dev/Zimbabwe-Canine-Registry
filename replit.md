# Zimbabwe Canine Registry (ZCR)

A blockchain-inspired mobile app for registering, verifying, and tracking dogs in Zimbabwe — built for breeders, veterinarians, owners, and regulators.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

- **Offline-first with AsyncStorage** — no backend on first build; all data stored locally in the Expo app. Seed data (4 dogs, 1 litter) pre-loaded on fresh install.
- **Dark-always theme** — both `light` and `dark` palette in `constants/colors.ts` use the same ZCR dark scheme (black #0D0D0D + gold #C9A84C) so the app is always dark regardless of system preference.
- **Role-based UI** — actions (health update, transfer, flag stolen) are gated in the UI by `user.role` from RegistryContext. No backend auth yet.
- **Expo Router file-based routing** — `app/(tabs)/` for tab screens, `app/dog/[id].tsx` for dog detail, `app/dog/health.tsx` and `app/dog/transfer.tsx` for actions. These are registered as Stack screens in `app/_layout.tsx`.
- **useColors() fix** — uses `colors.dark ? colors.dark : colors.light` (direct property access) instead of casting the whole colors object, avoiding TS2352 errors.

## Product

**Zimbabwe Canine Registry (ZCR)** — a mobile app (Expo/React Native) providing:
- Dog registration with ISO microchip ID, lineage, health, and ownership data
- Litter pre-registration tied to certified parentage
- Veterinary health record updates (role-gated)
- Ownership transfers with audit trail
- Stolen dog flagging
- Microchip lookup / verification
- Role-based access: Owner, Breeder, Vet, Regulator
- AsyncStorage persistence (offline-first)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

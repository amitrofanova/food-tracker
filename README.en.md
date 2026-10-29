# Food Tracker

🇬🇧 English | [🇷🇺 Русский](README.md)

Full-stack app for a daily food diary, calorie and macronutrient tracking. The UI is in Russian.

Available at https://food-tracker.37.46.129.184.sslip.io/

Guest use is local (IndexedDB). An account stores the same data on the server; after login you can copy unsynced local diary entries, custom products, and recipes into the account.

## Features

- Registration and login (email + password, at least 8 characters)
- Guest mode — diary, custom products, and recipes without an account
- Food diary by meal (breakfast, lunch, dinner, snack), with date navigation
- Daily calories and macros (protein, fat, carbs); personal calorie budget when logged in
- Product search in [Open Food Facts](https://world.openfoodfacts.org) (via the API)
- Barcode scan on the native app (EAN/UPC → Open Food Facts)
- Custom products and a recipe builder (nutrition per 100 g, portion on screen)
- Calorie calculator (Mifflin–St Jeor BMR, TDEE, lose / maintain / gain)
- Voice add-to-diary after login (speech → intent via OpenRouter)
- After login: prompt to sync or discard local guest data

Calories, protein, fat, and carbs on products, recipes, and diary rows are **per 100 g**. The UI multiplies by weight / 100 for the portion. A diary row stores a snapshot (`productName` + macros), so editing a custom product later does not rewrite past days.

## Auth and clients

- **Browser:** session in httpOnly cookies (`access_token`, `refresh_token`), `withCredentials`. Login/refresh JSON is the user object only — no tokens in the body.
- **Capacitor:** `X-Client: capacitor`; access and refresh JWTs in the JSON body, stored in Preferences; `Authorization: Bearer` on API calls.
- Refresh tokens are rotated; reusing a revoked refresh invalidates that user’s refresh family.
- Write endpoints (auth, diary, custom products, recipes, `PATCH /api/auth/me`) are validated with Zod.

Catalog search (`GET /api/products/search`, barcode) does not require login. Diary, custom products, recipes, profile, and voice parse do.

## Tech stack

### Client

| Technology | Role |
| --- | --- |
| Vue 3 (Composition API, `<script setup>`) | UI |
| TypeScript | Types |
| Pinia | Client state |
| Vue Router | Routes |
| TanStack Query | Cache for Open Food Facts search pages |
| Axios | HTTP (`/api`, cookies) |
| Dexie (IndexedDB) | Guest data and a local cache |
| Vite | Dev server and build |
| Capacitor | Android / iOS shell |
| FSD + Steiger | Layers and boundary lint |

### Server

| Technology | Role |
| --- | --- |
| Fastify | HTTP, static SPA in production |
| Prisma + PostgreSQL | Data |
| JWT, httpOnly cookies, bcrypt | Auth |
| Zod | Write-payload validation |
| Helmet, CORS, rate limit | Hardening |
| Open Food Facts | Product catalog proxy |
| OpenRouter | Voice intent parse |

Client and server both use Vitest.

## Project structure

`client/` and `server/` live in this monorepo (Yarn workspaces).

```
food-tracker/
├── client/                     # Vue 3 SPA
│   └── src/
│       ├── app/                # Bootstrap, router, styles
│       ├── pages/              # home, search, my-products, recipes, recipe-detail, calorie-calculator
│       ├── widgets/            # header, diary blocks, add-entry, voice
│       ├── features/           # auth, search, create product/recipe, calorie budget, sync
│       ├── entities/           # user, product, diary-entry, recipe
│       └── shared/             # UI, API client, Dexie, config
├── server/                     # Fastify API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/             # /api/auth, entries, products, custom-products, recipes, voice
│   │   ├── middleware/         # JWT from cookie or Bearer
│   │   └── lib/                # Prisma, cookies/tokens, Zod schemas
│   └── prisma/
├── Dockerfile                  # Production image (COPY client / COPY server)
├── docker-compose.yml          # Local dev with hot reload
├── docker-compose.prod.yml     # App + Postgres on one host
└── .env.example
```

## Local development

```bash
git clone git@github.com:amitrofanova/food-tracker.git
cd food-tracker
yarn
```

### Docker Compose

```bash
docker compose up --build
```

- Client: http://localhost:5174 (`/api` is proxied to the server)
- API: http://localhost:3001 (`GET /health`)
- Postgres: `localhost:5433` (user/password/db: `postgres` / `postgres` / `food_tracker`)

Voice parse needs `OPENROUTER_API_KEY` in the environment (Compose passes it into the server). Without the key, the rest of the app still runs; voice returns 503.

### Without Compose

Server (Node 22, `DATABASE_URL` and `JWT_SECRET` required):

```bash
yarn
yarn workspace server prisma generate
yarn workspace server prisma migrate deploy
yarn dev:server
```

Client:

```bash
yarn dev:client
# or: yarn workspace food-tracker-client dev
```

Vite proxies `/api` to `http://localhost:3001` (or `API_PROXY_TARGET`).

Tests: `yarn test` (both workspaces), or `yarn test:client` / `yarn test:server`.

## Environment (production)

Copy `.env.example` to `.env`. Compose builds `DATABASE_URL` from `POSTGRES_*` — do not set `DATABASE_URL` in `.env`.

| Variable | Purpose |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres |
| `JWT_SECRET` | Access-token signing (required, no code fallback) |
| `APP_ORIGIN` | SPA origin for CORS (e.g. `https://your-domain`) |
| `OPENROUTER_API_KEY` | Voice parse; omit to disable |
| `OFF_USER_AGENT` | User-Agent for Open Food Facts (identify the app + contact) |
| `NODE_ENV` | `production` |
| `PORT` | Default `3001` |

## Deployment

Production is one Docker host: `docker-compose.prod.yml` builds from `Dockerfile` and starts the app next to Postgres. Postgres is not published; the app binds to `127.0.0.1:3001`.

The production **Dockerfile** builds from the repository context (`COPY client` / `COPY server`), so the image matches the git commit you deploy.

```bash
cp .env.example .env   # POSTGRES_PASSWORD, JWT_SECRET, APP_ORIGIN
docker compose -f docker-compose.prod.yml up -d --build
```

On start the container runs `prisma migrate deploy`, then serves the API and the built SPA.

## Mobile (Capacitor)

The client is wrapped with [Capacitor](https://capacitorjs.com) (`client/android`, `client/ios`). Barcode scanning is native-only. For a non-same-origin API, set `VITE_API_BASE_URL` when building.

```bash
cd client
yarn
yarn build:mobile   # vite build --mode mobile && cap sync
```

There is no published APK/store listing yet.

# Food Tracker

[🇬🇧 English](README.md) | 🇷🇺 Русский

Приложение для пищевого дневника и учёта калорий и БЖУ. Интерфейс на русском.

Без аккаунта данные живут локально (IndexedDB). С аккаунтом — на сервере; после входа можно перенести несинхронизированные записи дневника, свои продукты и рецепты в аккаунт.

## Функции

- Регистрация и вход (email + пароль, минимум 8 символов)
- Гостевой режим — дневник, свои продукты и рецепты без аккаунта
- Дневник по приёмам пищи (завтрак, обед, ужин, перекус) и датам
- Сводка за день по калориям и БЖУ; своя норма калорий после входа
- Поиск продуктов в [Open Food Facts](https://world.openfoodfacts.org) (через API)
- Сканирование штрихкода в нативном приложении (EAN/UPC → Open Food Facts)
- Свои продукты и конструктор рецептов (КБЖУ на 100 г, на экране — порция)
- Калькулятор нормы (Mifflin–St Jeor, TDEE, похудение / поддержание / набор)
- Голосовое добавление в дневник после входа (речь → разбор через OpenRouter)
- После входа: перенести локальные данные в аккаунт или отбросить их

Калории, белки, жиры и углеводы у продуктов, рецептов и записей дневника хранятся **на 100 г**. Экран считает порцию как macros × вес / 100. Запись дневника — снимок (`productName` + КБЖУ): правка своего продукта не меняет уже сохранённые дни.

## Авторизация и клиенты

- **Браузер:** сессия в httpOnly-cookie (`access_token`, `refresh_token`), `withCredentials`. В JSON login/refresh только пользователь, без токенов.
- **Capacitor:** заголовок `X-Client: capacitor`; access и refresh JWT в теле ответа, в Preferences; к API — `Authorization: Bearer`.
- Refresh ротируется; повтор отозванного refresh инвалидирует семейство токенов пользователя.
- Тела write-запросов (auth, дневник, свои продукты, рецепты, продукты, `PATCH /api/auth/me`) проверяются Zod.

Поиск каталога (`GET /api/products/search`, штрихкод) доступен без входа. Дневник, свои продукты, рецепты, профиль и разбор голоса — только с сессией.

## Стек технологий

### Клиент

| Технология | Роль |
| --- | --- |
| Vue 3 (Composition API, `<script setup>`) | UI |
| TypeScript | Типы |
| Pinia | Состояние клиента |
| Vue Router | Маршруты |
| TanStack Query | Серверное состояние и кэш |
| Axios | HTTP (`/api`, cookie) |
| Dexie (IndexedDB) | Гостевые данные и локальный кэш |
| Vite | Dev-сервер и сборка |
| Capacitor | Оболочка Android / iOS |
| FSD + Steiger | Слои и проверка границ |

### Сервер

| Технология | Роль |
| --- | --- |
| Fastify | HTTP, в проде — раздача SPA |
| Prisma + PostgreSQL | Данные |
| JWT, httpOnly-cookie, bcrypt | Аутентификация |
| Zod | Валидация тел записи |
| Helmet, CORS, rate limit | Защита |
| Open Food Facts | Прокси каталога продуктов |
| OpenRouter | Разбор голосовой фразы |

И клиент, и сервер покрыты тестами на Vitest.

## Структура проекта

`client/` и `server/` лежат в этом монорепозитории (Yarn workspaces).

```
food-tracker/
├── client/                     # Vue 3 SPA
│   └── src/
│       ├── app/                # Инициализация, роутер, стили
│       ├── pages/              # home, search, my-products, recipes, recipe-detail, calorie-calculator
│       ├── widgets/            # шапка, блоки дневника, добавление, голос
│       ├── features/           # auth, поиск, создание продукта/рецепта, норма калорий, sync
│       ├── entities/           # user, product, diary-entry, recipe
│       └── shared/             # UI, API-клиент, Dexie, конфиг
├── server/                     # Fastify API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/             # /api/auth, entries, products, custom-products, recipes, voice
│   │   ├── middleware/         # JWT из cookie или Bearer
│   │   └── lib/                # Prisma, cookie/токены, схемы Zod
│   └── prisma/
├── Dockerfile                  # Продакшн-образ (COPY client / COPY server)
├── docker-compose.yml          # Локальная разработка с hot reload
├── docker-compose.prod.yml     # Приложение + Postgres на одном хосте
└── .env.example
```

## Локальная разработка

```bash
git clone git@github.com:amitrofanova/food-tracker.git
cd food-tracker
yarn
```

### Docker Compose

```bash
docker compose up --build
```

- Клиент: http://localhost:5174 (`/api` проксируется на сервер)
- API: http://localhost:3001 (`GET /health`)
- Postgres: `localhost:5433` (пользователь/пароль/БД: `postgres` / `postgres` / `food_tracker`)

Для голоса нужен `OPENROUTER_API_KEY` в окружении (Compose пробрасывает его в сервер). Без ключа остальное работает; голос отвечает 503.

### Без Compose

Сервер (Node 22, обязательны `DATABASE_URL` и `JWT_SECRET`):

```bash
yarn
yarn workspace server prisma generate
yarn workspace server prisma migrate deploy
yarn dev:server
```

Клиент:

```bash
yarn dev:client
# или: yarn workspace food-tracker-client dev
```

Vite проксирует `/api` на `http://localhost:3001` (или на `API_PROXY_TARGET`).

Тесты: `yarn test` (оба workspace), или `yarn test:client` / `yarn test:server`.

## Переменные окружения (продакшн)

Скопировать `.env.example` в `.env`. Compose собирает `DATABASE_URL` из `POSTGRES_*` — в `.env` её не задавать.

| Переменная | Назначение |
| --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Postgres |
| `JWT_SECRET` | Подпись access-токена (обязателен, в коде фолбэка нет) |
| `APP_ORIGIN` | Origin SPA для CORS (например `https://your-domain`) |
| `OPENROUTER_API_KEY` | Разбор голоса; без ключа функция выключена |
| `OFF_USER_AGENT` | User-Agent для Open Food Facts (имя приложения + контакт) |
| `NODE_ENV` | `production` |
| `PORT` | По умолчанию `3001` |

## Деплой

Продакшн — один Docker-хост: `docker-compose.prod.yml` собирает образ из `Dockerfile` и поднимает приложение рядом с Postgres. Postgres в интернет не публикуется; приложение слушает `127.0.0.1:3001`.

Продакшн-**Dockerfile** собирает образ из контекста репозитория (`COPY client` / `COPY server`), поэтому образ соответствует тому git-коммиту, который вы деплоите.

```bash
cp .env.example .env   # POSTGRES_PASSWORD, JWT_SECRET, APP_ORIGIN
docker compose -f docker-compose.prod.yml up -d --build
```

При старте контейнер выполняет `prisma migrate deploy`, затем отдаёт API и собранную SPA.

## Мобильное приложение (Capacitor)

Клиент обёрнут в [Capacitor](https://capacitorjs.com) (`client/android`, `client/ios`). Сканер штрихкода работает только нативно. Если API не same-origin, при сборке задайте `VITE_API_BASE_URL`.

```bash
cd client
yarn
yarn build:mobile   # vite build --mode mobile && cap sync
```

Готового APK и публикации в магазине пока нет.

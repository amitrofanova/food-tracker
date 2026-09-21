Дорожная карта рефакторинга Food Tracker

Не переписывать приложение. Не менять стек (Vue 3, Pinia, Fastify, Prisma, Dexie, Capacitor). Каждый блок — новый Agent-чат + новая ветка. Этот Plan-чат после подтверждения должен сделать только блок 1 (rules + docs/refactoring-roadmap.md). Код безопасности и дальше — отдельные чаты.

flowchart TD
  b0[0_secrets_manual]
  b1[1_rules_and_roadmap]
  b2[2_security_idor_zod_tokens]
  b3[3_per100g_contract]
  b4[4_product_identity_snapshot]
  b5[5_sync]
  b6[6_fsd]
  b7[7_cleanup]
  b8[8_monorepo_docker]
  b9[9_git_history_manual]
  b0 --> b1 --> b2 --> b3 --> b4 --> b5 --> b6
  b5 --> b7
  b6 --> b8
  b8 --> b9

Параллелить почти нечего: 0 только вы; 7 можно частично с 6, если не трогать одни файлы; 9 только когда код заморожен.



С чего начать на этой неделе





Сегодня, руками — блок 0 (секреты). Репозитории уже публичные.



Первый Agent-чат — блок 1: правила и markdown с этой картой. Без правок client/src и server/src.



Второй Agent-чат — блок 2: IDOR + Zod + токены. Это первый код.



Что делать руками (не агенту)

Блок 0 — секреты (сегодня, до любого PR с кодом)





Отозвать VITE_GEMINI_API_KEY из истории [client](https://github.com/amitrofanova/food-tracker-client) (.env.mobile). Считать скомпрометированным.



Сменить JWT_SECRET и OPENROUTER_API_KEY на VDS, если могли утечь или если продом когда-либо жил с фолбэком your_strong_jwt_secret_should_be_in_env. После смены JWT все сессии умрут — это ожидаемо.



Сменить пароль Postgres, если .env когда-то светился.



Убедиться, что .env / server/.env / .env.mobile не в индексе. Не коммитить их.



Убрать личный email из дефолта OFF_USER_AGENT можно уже в блоке 2/7; до тех пор задать env.

Блок 9 — история git (последним, отдельное решение)

Не смешивать с фичами. Варианты: оставить как есть; archive private + новый публичный снимок одним initial commit; git filter-repo только если понимаете риск force-push. Агенту не давать --force и rewrite без явной фразы «да, перепиши историю».

Каждый блок с кодом





Новая ветка от актуального main.



В чат вставить только промпт блока, плюс @ на перечисленные файлы. Не прикладывать весь аудит.



Ревью диффа сами. UI — проверить в браузере. Коммит только по вашей просьбе.



На auth/IDOR: /review-security. На остальное: Bugbot по желанию.



.cursor/rules до кода (черновики)

Создать в корне воркспейса [food-tracker-deploy/.cursor/rules/](.cursor/rules/). Коротко, одно правило — одна тема. alwaysApply: true только у core.

core.mdc (alwaysApply: true)

# Core

Рефакторинг существующего приложения, не rewrite и не смена стека
(Vue 3, Pinia, Fastify, Prisma, Dexie, Capacitor).
Один Agent-чат = один блок из docs/refactoring-roadmap.md.
Менять только файлы из промпта блока. Не «заодно» править соседние темы
(FSD, Docker, UI), если это не этот блок.

fsd.mdc (globs: client/src/**/*.{ts,vue})

# FSD

Слои: app → pages → widgets → features → entities → shared.
Импорт только вниз. Слайсы одного слоя не импортируют друг друга.
Снаружи слайса — только index.ts public API.
shared не импортирует entities/features/widgets/pages.
Виджеты не импортируют виджеты.
Логин/регистрация — feature auth, не UI entity user.
Типы домена для DB/API либо в entities/*/api, либо нейтральные DTO в shared без импорта entities.
Новый код не обходит public API глубокими путями.
Не делать широкий FSD-переезд вне блока 6.

api-security.mdc (globs: server/src/**/*.ts)

# API security

Zod на POST/PATCH/PUT. Ошибки валидации — 400 с сообщением из схемы.
upsert/update/delete по id: сначала find, сверка userId, иначе 404 (не палить чужое).
Не обновлять чужую строку через upsert where: { id }.
Refresh/access в JSON-теле — только native (заголовок/флаг). Веб — только httpOnly cookies.
Не логировать token, password, полный refresh.
JWT_SECRET обязателен, без фолбэка в коде.

nutrition-units.mdc (globs: {client,server}/src/**/*.{ts,vue})

# Nutrition units

IProduct / CustomProduct / Recipe.calories|protein|fat|carbs = на 100 г.
Порция = macros100g * weight / 100 только на чтении или в отдельном поле portion*.
Офлайн IndexedDB для записей дневника хранит те же per-100g, что и API, либо явно два поля.
Не слать в POST /api/entries калории порции в полях calories/protein/fat/carbs.

После блока 1 агент не должен «улучшать» правила без просьбы.



Блок 1 — первый Agent-чат (только файлы)

Цель. Зафиксировать правила и карту, чтобы следующие чаты не расползались.

Файлы. Создать: .cursor/rules/core.mdc, fsd.mdc, api-security.mdc, nutrition-units.mdc, docs/refactoring-roadmap.md (текст этой карты). Не менять client/, server/ код.

Промпт для нового чата (после этого Plan можно выполнить здесь же, если подтвердите): вставить раздел «Блок 1» как задачу: только эти файлы, без рефакторинга приложения.

Готово: правила на месте, roadmap в репо, git status без правок исходников приложения.



Промпты блоков 2–8

Копировать целиком в новый Agent-чат. Везде действует преамбула:



Работай в воркспейсе food-tracker-deploy. Не переписывай приложение. Следуй .cursor/rules. Не коммить, пока не попросят. Если нужно продуктовое решение вне инвариантов — остановись и спроси.

Блок 2 — безопасность API и сессий (первый код)

Цель. Закрыть IDOR кастомных продуктов, провалидировать write-ручки, не отдавать refresh/access вебу в JSON, не слать request: any.

Файлы (ориентир):





[server/src/controllers/customProductController.ts](server/src/controllers/customProductController.ts)



[server/src/controllers/recipeController.ts](server/src/controllers/recipeController.ts)



[server/src/controllers/entryController.ts](server/src/controllers/entryController.ts)



[server/src/controllers/authController.ts](server/src/controllers/authController.ts)



[server/src/controllers/productController.ts](server/src/controllers/productController.ts)



[server/src/lib/authValidation.ts](server/src/lib/authValidation.ts) — расширить или добавить server/src/lib/validation/*.ts



[server/src/lib/authTokens.ts](server/src/lib/authTokens.ts) — reuse detection семейства refresh



[client/src/shared/api/http.ts](client/src/shared/api/http.ts), [client/src/shared/api/auth.ts](client/src/shared/api/auth.ts), [client/src/entities/user/model/store.ts](client/src/entities/user/model/store.ts)



Подключить тестовый раннер на сервере (Vitest или node:test) — сейчас тестов нет

Инварианты:





POST /api/custom-products: если id существует и userId чужой → 404, тело не менять.



Рецепты: не создавать поверх чужого id (сейчас create после findFirst по своему userId может упасть на unique — сделать явный 404/409).



PATCH /api/auth/me: calorieBudget — целое в разумных границах или null, Zod.



Entries/products/recipes/custom: Zod, типизированные FastifyRequest.



Login/refresh для браузера: в JSON только user (и что нужно UI). Поля token/refreshToken только если native (X-Client: capacitor или уже существующий путь Preferences).



Повторно предъявленный отозванный refresh после ротации инвалидирует семейство токенов этого пользователя (reuse detection), не только null.



Веб по-прежнему логинится cookies + withCredentials.

Запреты: не менять Prisma schema; не трогать FSD-папки; не менять Dockerfile/clone; не рефакторить voice/OFF; не добавлять CSRF-пакет «на всякий случай».

Проверка:





Тесты: чужой custom product id не обновляется; валидный upsert своего id работает; calorieBudget отвергает строку/NaN; схема entries отвергает weight <= 0.



Вручную: логин в браузере (cookies), /api/auth/me после refresh, Capacitor не ломать если нечем проверить — не выкидывать native-тело токенов для Capacitor.isNativePlatform().



npx tsc на сервере, клиентский yarn type-check если задеты клиентские файлы.

Критерий готово: тесты зелёные, IDOR закрыт, веб-ответ login/refresh без токенов в теле, reuse detection есть, коммит только про безопасность.

Промпт (копировать):

Блок 2 дорожной карты: безопасность API и сессий. Не rewrite.

Цель: закрыть IDOR upsert custom products; Zod на write-ручки entries, custom products, recipes, products, PATCH /me; убрать request: any в этих контроллерах; веб не получает token/refreshToken в JSON (только cookies); native по-прежнему сохраняет токены в Preferences; reuse detection для refresh.

Файлы: server/src/controllers/{customProductController,recipeController,entryController,authController,productController}.ts, server/src/lib/authValidation.ts, server/src/lib/authTokens.ts, server/src/lib/authCookies.ts, client/src/shared/api/{http,auth}.ts, client/src/entities/user/model/store.ts. Можно добавить server/src/lib/validation/*.ts и server-тесты. Добавь минимальный test runner.

Инварианты: чужой custom product id → 404 без update; calorieBudget только валидное число/null; КБЖУ в этом блоке не переосмысляй, только не принимай мусор (finite >= 0). Refresh reuse: повтор отозванного токена сжигает семейство.

Запреты: без Prisma migration, без FSD-переезда, без Docker, без правок UI виджетов, без коммита пока не попросят.

Проверка: юнит-тесты IDOR и Zod; tsc сервера; type-check клиента если менял.

Критерий готово: перечисленные инварианты выполнены и покрыты тестами.



Блок 3 — контракт КБЖУ на 100 г (без смены схемы)

Цель. Одинаковые единицы онлайн и офлайн, чтобы sync не портил калории. Schema Prisma не трогать.

Файлы: [client/src/entities/diary-entry/model/store.ts](client/src/entities/diary-entry/model/store.ts), [client/src/features/sync-local-data/ui/SyncConfirmModal.vue](client/src/features/sync-local-data/ui/SyncConfirmModal.vue), [client/src/shared/api/diary.ts](client/src/shared/api/diary.ts), [server/src/controllers/entryController.ts](server/src/controllers/entryController.ts), типы [client/src/entities/diary-entry/model/types.ts](client/src/entities/diary-entry/model/types.ts) при необходимости явных полей.

Инварианты:





POST /api/entries поля calories|protein|fat|carbs = на 100 г. Сервер так и пишет в Product.



Офлайн IDiaryEntry хранит те же per-100g или раздельные caloriesPer100g + отображаемые порции. Нельзя чтобы sync слал порцию как per-100g.



UI дневника по-прежнему показывает порцию (* weight / 100).



Старые локальные записи: одноразовая миграция Dexie или эвристика в sync с комментарием; не молча портить.

Запреты: не менять schema.prisma; не решать unique name (это блок 4); не переносить FSD.

Проверка: тест: офлайн add 150 г продукта 200 ккал/100г → на сервер уходит calories: 200, не 300. Ручной: гость добавляет еду, логин, sync, цифры совпадают с до-логина.

Критерий готово: один контракт единиц, тест на сериализацию sync payload, UI не сломан.

Промпт:

Блок 3: контракт КБЖУ всегда на 100 г для API и IndexedDB записей. Без Prisma migration и без FSD.

Проблема: online addEntry шлёт product.calories на 100г, offline пишет порцию в IDiaryEntry.calories, sync POST-ит порцию, сервер кладёт это в Product как на 100г.

Инвариант: POST /api/entries calories/protein/fat/carbs = per 100g. Экран считает порцию отдельно. Sync не меняет смысл полей.

Файлы: client/src/entities/diary-entry/model/{store,types}.ts, client/src/features/sync-local-data/ui/SyncConfirmModal.vue, client/src/shared/api/diary.ts, server/src/controllers/entryController.ts, клиентские тесты на расчёт payload.

Запреты: schema.prisma, виджеты кроме необходимости отображения, Docker, коммит без просьбы.

Проверка: unit-тест payload; сценарий гость → логин → sync. type-check.

Критерий готово: тест зелёный, ручной sync не искажает ккал.



Блок 4 — идентичность продуктов + снимок в записи

Цель. Записи дневника не зависят от глобального Product.name @unique. Свои продукты/рецепты не затирают чужой каталог.

Решение (зафиксировано): на DiaryEntry хранить снимок productName + КБЖУ на 100 г (+ weight, meal, date). productId опционален (OFF barcode/id). Прекратить upsert Product по имени для кастомов и рецептов. Таблица Product — только кэш каталога OFF по желанию, не источник истины дневника.

Файлы: [server/prisma/schema.prisma](server/prisma/schema.prisma), миграция, [server/src/controllers/entryController.ts](server/src/controllers/entryController.ts), клиентский diary store/API, возможно sync.

Инварианты:





Два пользователя с «Творог» и разными КБЖУ не мешают друг другу.



Изменение кастома не переписывает уже сохранённые дни (снимок).



Авторизация: запись принадлежит request.user.id.



Миграция существующих строк: заполнить снимок из связанного Product.

Запреты: не переезжать на FSD; не делать микросервис каталога; не тащить монорепу.

Проверка: тест создания двух пользователей с одним именем продукта; get entries отдаёт снимок; migrate deploy на копии БД.

Критерий готово: миграция применяется, unique-name больше не ломает дневник, тесты зелёные.

Промпт:

Блок 4: снимок КБЖУ на DiaryEntry, не upsert глобального Product по имени для кастомов/рецептов/офлайн.

Цель: DiaryEntry хранит productName + calories/protein/fat/carbs на 100г + weight. productId опционален. createEntry не делает Product.upsert where name для пользовательской еды. Миграция заполняет снимок из Product.

Файлы: server/prisma/schema.prisma, новая migration, entryController, client diary API/store, тесты сервера.

Инварианты: изоляция пользователей по имени продукта; история дней не плывёт при edit кастома; userId только из токена.

Запреты: FSD-переезд, Docker clone, voice, коммит без просьбы. Не удалять таблицу Product в этом PR, если ещё нужен кэш OFF — можно оставить, но дневник от неё не зависит.

Проверка: prisma migrate, tsc, тесты двух пользователей и snapshot read.

Критерий готово: инварианты + миграция.



Блок 5 — sync как сценарий

Цель. Предсказуемая заливка локальных данных после логина: ошибка посередине не оставляет «половину», pending считает все типы, конфликт обрабатывается явно.

Файлы: [client/src/features/sync-local-data/](client/src/features/sync-local-data/), [client/src/shared/lib/useSyncedEntity.ts](client/src/shared/lib/useSyncedEntity.ts), [client/src/entities/user/model/store.ts](client/src/entities/user/model/store.ts). Вынести логику из модалки в lib/syncLocalData.ts.

Инварианты:





Pending = entries + custom products + recipes, не только entries.



Успех: все три типа ушли или ничего не помечается синкнутым (транзакция на клиенте: не clear() entries, пока все POST не 2xx; лучше идемпотентный replay по стабильному id).



Показ ошибки, не finally без catch.



useSyncedEntity после логина не уничтожает несинкнутое локальное без подтверждения.



UI модалки на русском, как остальное приложение.

Запреты: не писать CRDT/Firebase; не блок 6 FSD кроме минимального public API feature; не менять Prisma кроме нужды id.

Проверка: тест синка с моком http: второй POST падает → локальные entries не purge. Ручной: офлайн продукт+запись → логин → Yes sync / Discard.

Критерий готово: вынесенная функция синка с тестом на частичный отказ; модалка только UI.

Промпт:

Блок 5: sync локальных данных. Без rewrite и без FSD-переезда.

Цель: вынести confirmSync из SyncConfirmModal в тестируемую функцию. Идемпотентность по стабильным id. Не clear IndexedDB entries пока все запросы не успели. pendingCount включает products/recipes. Ошибка пользователю. useSyncedEntity не wipe неподтверждённое. Тексты модалки на русском.

Файлы: client/src/features/sync-local-data/**, client/src/shared/lib/useSyncedEntity.ts, user store только если флаги pending. Тесты клиента (Vitest).

Запреты: Prisma, Docker, перенос auth UI, коммит без просьбы.

Проверка: unit-тест частичного отказа; ручной гость→логин→sync/discard.

Критерий готово: тест на abort; модалка без бизнес-логики циклов.



Блок 6 — FSD до проверяемых границ

Цель. Убрать нарушения, не «идеальный FSD». Включить steiger или eslint-boundaries.

Обязательные переносы:





LoginForm / RegisterForm / UserAuthModal → features/auth (entity user: store, types, UserMenu).



VoiceButton не импортировать из [widgets/header](client/src/widgets/header/ui/AppHeader.vue): voice — feature, header получает слот или композицию на page/app.



[AddDiaryEntry](client/src/widgets/add-diary-entry/ui/AddDiaryEntry.vue) не импортирует widgets/recipe-form: форму рецепта опустить в feature create-recipe (UI сейчас в виджете — перенести).



[shared/db/index.ts](client/src/shared/db/index.ts) и shared/api/* не импортируют @/entities/*: DTO рядом с db/api или entity api-модули.



Запретить глубокие импорты мимо index.ts.

Запреты: не менять поведение синка/auth заново; не редизайн UI; не трогать android/ios кроме импортов.

Проверка: steiger/eslint падает на widget→widget; yarn type-check; ручной проход: логин, поиск, рецепт, голос.

Критерий готово: линтер границ в CI-скрипте клиента; перечисленные cross-import исчезли.

Промпт:

Блок 6: FSD-границы. Поведение приложения не менять.

Убрать: widgets/header → voice widget; add-diary-entry → recipe-form widget; shared/db и shared/api → entities. Вынести auth UI в features/auth. Recipe form UI в features/create-recipe. Public API только index.ts. Включить steiger или eslint-plugin-boundaries, зафиксировать в client/package.json lint.

Следуй .cursor/rules/fsd.mdc. Минимум файлов. Не трогать сервер, Docker, Prisma.

Проверка: type-check, lint границ, ручной смоук основных экранов.

Критерий готово: линтер ловит новые нарушения; старые из аудита закрыты.



Блок 7 — чистка продукта

Цель. Убрать следы экспериментов, выровнять README с кодом.

Файлы: [client/src/widgets/mobile-bottom-menu/MobileBottomMenu.vue](client/src/widgets/mobile-bottom-menu/MobileBottomMenu.vue) (кнопка ccc, console.log) — удалить мёртвое или довести; [VoiceButton.vue](client/src/widgets/voice-diary-entry/ui/VoiceButton.vue) закомментированный openAuthModal; Capacitor camera/push если не используются; [README.md](README.md), [README.ru.md](README.ru.md), [client/README.md](client/README.md) (там ложь про «данные не на сервер»); email в OFF User-Agent; i18n модалок.

Запреты: новая функциональность; не блок 8.

Проверка: поиск ccc, console.log в src; README описывает cookies, offline sync, Zod не как повсеместный если ещё не везде.

Критерий готово: нет мёртвого UI, README = правда.

Промпт:

Блок 7: чистка. Удалить или починить MobileBottomMenu (ccc). Включить openAuthModal для голоса без аккаунта. Убрать неиспользуемые Capacitor camera/push если нет кода. Починить README корня и client/README под фактический стек (httpOnly cookies, Dexie+API, Zod на write). OFF_USER_AGENT без личного email в дефолте. Без FSD-переезда и без Docker.

Критерий: grep по ccc/закомментированному auth; README без противоречий.



Блок 8 — деплой воспроизводимый (опционально, после стабилизации)

Цель. Docker собирает этот коммит, не git clone latest main.

Файлы: [Dockerfile](Dockerfile), [docker-compose.prod.yml](docker-compose.prod.yml). Предпочтение: COPY client / COPY server из контекста deploy-репо. Если submodule остаются — пин SHA в Dockerfile, не clone main.

Запреты: не force-push; не объединять репозитории в этом же PR, если не решили монорепу отдельно (монорепа = отдельный под-блок 8b, только с вашего «да»).

Проверка: docker build без github clone; образ содержит текущие локальные изменения.

Критерий готово: прод-сборка детерминирована от git SHA воркспейса.

Промпт:

Блок 8: убрать git clone client/server из Dockerfile. Собирать из локального контекста COPY. Не переписывать приложение. Не трогать бизнес-логику. Не коммитить секреты.

Проверка: docker build. Критерий: в Dockerfile нет github.com/amitrofanova clone.
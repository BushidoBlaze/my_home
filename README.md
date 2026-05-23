# 🏠 Мой Дом / My Home

> Цифровая платформа управления жилым комплексом для УК и жителей.
> A digital platform for residential complex management — for property management companies and residents.

[![.NET](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org/)

---

## 📖 О проекте

**Мой Дом** объединяет в одной системе трёх участников:

- 🏢 **Управляющая компания** — диспетчер, инженер, бухгалтер, директор
- 👨‍👩‍👧 **Жильцы** — собственники и арендаторы квартир
- 🔧 **Подрядчики** — внешние исполнители работ

Платформа закрывает основные операционные циклы УК (заявки, начисления, голосования, регуляторные сроки, чаты) и базовые сценарии жителя (подача заявок, оплата ЖКУ, передача показаний, голосования, маркетплейс услуг).

---

## ✨ Ключевые возможности

### Для управляющей компании

- 📊 **Дашборд** — 5 KPI-карточек (открытые заявки, без исполнителя, аварии, собираемость, показания) с переходом на детальные списки
- 📋 **Приоритетная очередь заявок** — сортировка по приоритету (High / Med / Low), быстрое назначение исполнителя
- 💰 **Сборы и долги** — собираемость текущего месяца, тренд за 9 месяцев, топ-должников
- ⚠️ **Регуляторные сроки** — лифты, газ (ВДГО), пожарка, дымоходы с индикацией «горит / скоро / норма»
- 🗳 **Голосования (ОСС)** — создание с рассылкой push, контроль кворума, формирование протоколов
- 🏘 **Дома и квартиры** — реестр объектов, лицевых счетов, индивидуальные счётчики
- 💬 **Чат и обращения** — единая входная точка для коммуникации с жильцами
- 📈 **Аналитика и отчёты** — выгрузка для ГИС ЖКХ, ГЖИ

### Для жителя

- 📱 **Подача заявок** — категория, фото, отслеживание статуса
- 💳 **Оплата ЖКУ** — квитанции, история, СБП / СберPay (в планах)
- 📊 **Передача показаний** — ИПУ электричество / вода / газ
- 🗳 **Голосования** — участие в ОСС, контроль кворума
- 💬 **Чаты** — с диспетчером УК, с соседями, в группах подъезда
- 🛒 **Маркетплейс** — клининг, ремонт, доставка от проверенных подрядчиков

---

## 🛠 Технологический стек

| Слой | Технологии |
|---|---|
| **Frontend** | React 19, TypeScript 5, Vite 7, React Router, Sonner (toast), lucide-react |
| **Backend** | .NET 10, ASP.NET Core, Entity Framework Core, FluentValidation, JWT-аутентификация |
| **База данных** | PostgreSQL 16 |
| **Realtime** | SignalR (чаты) |
| **API** | REST с JSON, OpenAPI / Swagger в dev-режиме |
| **Архитектура** | Чистая архитектура: Domain → Application → Infrastructure → Api |

---

## 🗂 Структура проекта

```
my-home/
├── backend/                      # .NET 10 solution
│   ├── MyHome.Api/               # ASP.NET Core: контроллеры, hub-ы, Program.cs
│   │   ├── Controllers/          # 14 контроллеров (Auth, Tickets, Polls, Dashboard, …)
│   │   ├── Dtos/                 # Контракты ответов API
│   │   ├── Hubs/                 # SignalR-хабы (ChatHub)
│   │   └── Validation/           # FluentValidation-валидаторы
│   ├── MyHome.Application/       # Use-cases, сервисы (тонкий слой)
│   ├── MyHome.Domain/
│   │   └── Entities/             # User, ServiceRequest, Poll, ComplianceDeadline, …
│   └── MyHome.Infrastructure/
│       ├── Persistence/          # AppDbContext, DbSeeder
│       └── Migrations/           # EF Core миграции
└── web/                          # React + Vite фронтенд
    └── src/
        ├── app/                  # Корневой компонент, маршрутизация
        ├── api/                  # API-клиенты (axios-style через fetch)
        ├── apps/
        │   ├── manager/          # Кабинет УК
        │   │   ├── layouts/
        │   │   └── pages/        # home, tickets, vote, billing, buildings, meter,
        │   │                     # chat, account, ticketDetail
        │   └── resident/         # Кабинет жителя
        │       └── pages/        # home, requests, expenses, chats, voting,
        │                         # marketplace, news, account, settings, help
        ├── pages/                # Маркетинговые страницы (home, tariffs, blog, …)
        ├── layouts/              # MarketingLayout
        ├── widgets/              # Sidebar, TopBar, Header, TariffsSection
        └── shared/
            ├── ui/               # Avatar, Donut, Spark, Progress, Stat, …
            ├── hooks/            # useAuth, useScrollReveal, useHorizontalScroll
            ├── constants/        # Палитра, эндпоинты
            └── assets/styles/    # global.css, admin.css
```

---

## 🚀 Быстрый старт

### Требования

- **Node.js** 20+
- **.NET SDK** 10+
- **PostgreSQL** 16+

### 1. Frontend

```bash
cd web
npm install
npm run dev        # → http://localhost:5174
```

Переменные окружения (`web/.env`):

```
VITE_API_URL=http://localhost:5211/api
```

### 2. Backend

```bash
cd backend
dotnet restore
dotnet run --project MyHome.Api    # → http://localhost:5211
```

При первом запуске:

- Автоматически применяются миграции (`db.Database.MigrateAsync()`)
- `DbSeeder` заполняет демо-данные (регуляторные сроки и т.п.)
- Swagger UI доступен на `http://localhost:5211/swagger`

Локальные секреты (строка подключения и JWT-ключ) **не хранятся в репозитории**.
Их нужно задать одним из способов:

1. Локальный файл `backend/MyHome.Api/appsettings.Development.json` (в `.gitignore`),
   либо
2. Переменные окружения:

```bash
export ConnectionStrings__DefaultConnection="Host=localhost;Port=5432;Database=myhome_db;Username=postgres;Password=<your-password>"
export Jwt__Key="$(openssl rand -base64 64)"   # минимум 32 байта
```

Приложение упадёт на старте, если `Jwt__Key` короче 32 байт — это намеренно.

### 3. Без бэкенда (дизайн-режим)

Фронт корректно работает без поднятого бэкенда — каждый блок дашборда показывает карточку «Не удалось загрузить данные» с кнопкой «Повторить». Это полезно при работе только с UI.

---

## 🗃 Модель данных (основные сущности)

| Сущность | Назначение |
|---|---|
| `User` | Жильцы и сотрудники УК (роль определяется полем `Role`) |
| `Apartment` | Квартиры с привязкой к жильцу |
| `ServiceRequest` | Заявки. Поля: `Status`, `Category`, `Priority`, `AssigneeId` |
| `UtilityBill` | Начисления ЖКУ |
| `MeterReading` | Показания счётчиков |
| `Poll` + `PollOption` + `PollVote` | Голосования (ОСС, опросы) |
| `Chat` + `ChatMessage` + `ChatMember` | Чаты с реакциями и реплаями (через SignalR) |
| `ComplianceDeadline` | Регуляторные сроки (лифт, газ, пожарка, дымоходы) |
| `Notification` | Уведомления внутри приложения |
| `Service` + `ServiceOrder` + `ServiceReview` | Маркетплейс услуг |
| `Subscription` | Подписки УК (Basic / Premium) |
| `NewsPost` + `NewsComment` | Объявления УК |
| `SupportTicket` | Обращения в поддержку платформы |

---

## 🔐 Аутентификация

- **JWT Bearer** для REST-вызовов (заголовок `Authorization: Bearer <token>`)
- **Query-token** для SignalR (`?access_token=...`) — браузер не позволяет задать заголовок при WebSocket-handshake
- Роли в claim: `Manager` (УК) и `Resident` (житель)
- Защита маршрутов на фронте: `<ManagerRoute>` и `<PrivateRoute>` в `web/src/app/App.tsx`

---

## 📡 API

Все эндпоинты под префиксом `/api`. Полный список доступен в **Swagger UI**
(только в Development-режиме): `http://localhost:5211/swagger`.

Реалтайм-чаты — через SignalR-хаб `/hubs/chat` (авторизация JWT через query-параметр `access_token`).

---

## 🧪 Что протестировано

- ✅ Сборка backend `dotnet build` — 0 ошибок, 0 предупреждений
- ✅ Все миграции применяются: `InitialCreate` → … → `AddServiceRequestPriorityAndAssignee`
- ✅ `DbSeeder` идемпотентен (повторный запуск ничего не дублирует)
- ✅ Graceful degradation: при недоступном бэке UI показывает явные ошибки загрузки и кнопку «Повторить»
- ✅ Маршруты УК (8 страниц) — все интерактивные элементы работают и навигируют
- ✅ Создание голосования → POST `/api/polls` → рассылка `Notification` всем жильцам
- ✅ TopBar поиск разворачивается влево с анимацией, popover уведомлений с outside-click
- ✅ Sidebar поиск фильтрует пункты меню, профиль открывает Profile / Logout

---

## 🎯 Бизнес-модель

| Источник дохода | Модель |
|---|---|
| Подписка УК | 12 000 ₽/мес за дом (gradient для крупных УК) |
| Комиссия маркетплейса | 5–7% с каждой сделки |
| Платные модули | 1С-интеграция, расширенная аналитика, white-label |
| Реклама партнёров | Ненавязчивая, релевантная (сервисные компании) |
| Для жителей | Полностью бесплатно |

---

## 🗺 Roadmap

### MVP (текущий статус)

- [x] Маркетинговые страницы (home, tariffs, blog, residents, management)
- [x] Регистрация / вход / JWT
- [x] Кабинет жителя: заявки, оплата, чаты, голосования, маркетплейс
- [x] Кабинет УК: дашборд, заявки, голосования, аккаунт
- [x] Регуляторные сроки в БД и UI
- [x] Чаты в реальном времени (SignalR)

### Next

- [ ] Push-уведомления через FCM / APNs
- [ ] Мобильное приложение (React Native / PWA)
- [ ] Интеграция с 1С (выгрузка начислений и оплат)
- [ ] Платёжные шлюзы (СберPay, СБП)
- [ ] Голосовой помощник «Алиса»
- [ ] IoT-модули (умные счётчики, шлагбаум по QR)
- [ ] Сертификация в реестре российского ПО

### Long-term

- Облачное развёртывание в Yandex Cloud
- Аналитика и ML для прогноза собираемости
- Расширение в регионы

---

## 👤 Автор

**Атласов Р.Р.** — студент СИ-46

Дипломный проект: «Цифровая платформа управления жилым комплексом»

---

## 📄 Лицензия

Все права защищены. Платформа находится в стадии разработки.

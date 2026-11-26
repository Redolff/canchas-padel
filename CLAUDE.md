# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Padel Center is a club management admin panel for a padel tennis club. It consists of:
- **Frontend**: Angular 18 SPA (port 4200) — standalone components, signals-based state
- **Backend**: Laravel 11 API (port 8000) — Sanctum token auth, SQLite

---

## Commands

### Docker (preferred)

```bash
docker compose up                   # start both frontend + backend
docker compose up --build           # rebuild images first
docker compose exec app sh          # shell into Angular container
docker compose exec backend sh      # shell into Laravel container
```

### Frontend

```bash
npm start                           # ng serve --host 0.0.0.0 --poll=500
npm run build                       # production build → dist/padel-center-admin
npm run watch                       # dev build with watch
```

### Backend

```bash
# Run artisan commands via Docker:
docker run --rm -v "$(pwd)/backend":/var/www -w /var/www php:8.4-cli php artisan <command>

php artisan migrate                 # run pending migrations
php artisan db:seed                 # seed Diego Manager user
php artisan test                    # run PHPUnit tests
```

### Bootstrap Laravel from scratch

```bash
# Scaffold (no local PHP needed):
docker run --rm -v "$(pwd)":/app -w /app composer:2 create-project laravel/laravel backend --prefer-dist

# Install a package:
docker run --rm -v "$(pwd)/backend":/app -w /app composer:2 require <package>

# Publish and run migrations:
docker run --rm -v "$(pwd)/backend":/var/www -w /var/www php:8.4-cli sh -c \
  "php artisan vendor:publish --tag=sanctum-migrations && php artisan migrate --force"
```

---

## Architecture

### Angular Frontend

**Pattern:** All components are standalone (no NgModules). State lives in Angular signals (`signal()`, `computed()`). No RxJS except for HTTP calls via `AuthService`.

**Routing** (`src/app/app.routes.ts`):
- `''` → redirects to `dashboard`
- `login` → lazy `LoginComponent` (outside shell)
- `''` shell → `ShellComponent` (sidebar + topbar layout) with children:
  - `dashboard`, `schedule`, `reservations`

**Core services** (`src/app/core/services/`):
- `reservation.service.ts` — HTTP-backed signal store; `load()` called once in `ShellComponent.ngOnInit()`, after which all components read from the reactive signal. `addReservation()` and `updateReservation()` return `Observable<Reservation>` so callers can handle 422 overlap errors. Exports `STATUS_STYLE` (status → `{bg, fg, dot}`) and `COURTS`.
- `schedule.service.ts` — signal-backed bookings store; exports `COURTS` array (source of truth for courts)
- `user.service.ts` — current user signal; `setUser()` / `signOut()`
- `auth.service.ts` — `HttpClient` wrapper; `login()` → `POST /api/login` → `Observable<LoginResponse>`

**HTTP interceptor** (`src/app/core/interceptors/auth.interceptor.ts`): functional interceptor that attaches `Authorization: Bearer <token>` from `localStorage` to all `/api/` requests. Registered via `provideHttpClient(withInterceptors([authInterceptor]))` in `app.config.ts`.

**Component pattern** (follow this for all feature components):
```typescript
// Module-level pure helpers (outside class)
function todayIso(): string { return new Date().toISOString().slice(0, 10); }

// View-model interface
interface RowVM { ... }

@Component({ standalone: true, ... })
export class MyComponent {
  private readonly myService = inject(MyService);

  // Writable state
  activeTab = signal<string>('all');

  // Derived state (no subscriptions, no constructor logic)
  readonly rows = computed((): RowVM[] => { ... });
}
```

**Shared components** (`src/app/shared/components/`): `AvatarComponent`, `BookingModalComponent`, `CourtArtComponent`, `CourtMiniComponent`, `IconComponent`.

**`BookingModalComponent`**: Accepts `[preset]` (partial `Booking` — if `preset.id` exists it's edit mode), `[courts]` array, `[error]` string for displaying server-side validation errors, emits `(save)` / `(cancel)`. Used in Dashboard and Reservations. Parent components own a `modalError = signal<string | null>(null)` and pass it down; on 422 response, extract `err.error?.errors` first value and set it.

### Mobile UI

**Breakpoint**: `@media (max-width: 768px)` throughout. Desktop elements carry `.desktop-only`, mobile elements carry `.mobile-only` (both defined in `_base.scss`).

**`!important` rule**: `_base.scss` sets `.mobile-only { display: block !important }` on mobile. Any mobile container that needs `display: flex` **must** override with `display: flex !important` in its own component media query — otherwise the `block` wins and flex children stop working.

**`MobileNavComponent`** (`src/app/features/admin/layout/mobile-nav/`): floating pill bottom nav with 5 tabs — Hoy (`/dashboard`), Reservas (`/reservations`), Nueva (FAB, emits `(newBooking)`), Jugadores, Más (sign-out popup). Uses flat CSS selectors (not BEM `&--` nesting) to avoid CSS native nesting incompatibility. Rendered inside `ShellComponent`; hidden on desktop.

**Mobile layout pattern**: each feature component has a `<div class="feat-mobile mobile-only pc-root">` block alongside the desktop block (`<div class="feat desktop-only">`). Both live in the same component. The mobile block is a full-screen flex column: topbar → scrollable content area → (pagination or bottom sheet as needed). The scrollable area requires `flex: 1; min-height: 0; overflow-y: auto` — `min-height: 0` is mandatory or flex children won't shrink and scroll won't engage.

**Mobile reservations date grouping** (`groupedMobileRows` in `reservations.component.ts`): groups `rows()` by date, then sorts so **today appears first**, future dates ascending (nearest first), past dates descending (most recent first). The `todayIso()` module-level helper must be defined in each component file that uses it — it is not globally available.

### Laravel Backend

**Auth flow**: `POST /api/login` → validates credentials → `createToken()` → returns `{ token, user }`. Angular stores token in `localStorage` and sends as `Authorization: Bearer <token>`.

**Routes** (`backend/routes/api.php`):
```
POST   /api/login                              (public)
GET    /api/user                               (auth:sanctum)
POST   /api/logout                             (auth:sanctum)
GET    /api/reservations                       (auth:sanctum)
POST   /api/reservations                       (auth:sanctum)
GET    /api/reservations/{bookingRef}          (auth:sanctum)
PUT    /api/reservations/{bookingRef}          (auth:sanctum)
PATCH  /api/reservations/{bookingRef}/status   (auth:sanctum)
DELETE /api/reservations/{bookingRef}          (auth:sanctum)
```

Route model binding on `Reservation` resolves by `booking_ref` (via `getRouteKeyName()`). `PATCH /status` must be declared **before** `apiResource` in routes/api.php so it takes precedence.

`JsonResource::withoutWrapping()` is set in `AppServiceProvider::boot()` so collection responses are plain JSON arrays, not `{"data":[...]}`.

**Overlap validation**: `ReservationController::assertNoOverlap()` uses `CAST(? AS REAL)` in all SQLite comparisons. This is required because PHP PDO converts whole-number floats (e.g. `10.0`) to the string `"10"` when binding, and SQLite ranks TEXT above REAL in type comparisons, making arithmetic comparisons silently return the wrong result.

**Reservation ordering**: `index()` uses `orderByDesc('booking_ref')`. Do **not** use `orderByDesc('id')` — the seeder inserts rows in reverse `booking_ref` order so `id` and `booking_ref` are inversely correlated. Do **not** use `orderByDesc('created_at')` — batch-inserted seed rows share the same timestamp. Lexicographic sort on `booking_ref` (all share `PD-` prefix + 4-digit suffix) equals numeric sort.

**Database**: SQLite at `backend/storage/db/database.sqlite` (mounted via Docker volume `sqlite_data:/var/www/storage/db`). Seeded user: `diego@padelcenter.com.ar` / `admin123`. Seeded with 25 reservations (`ReservationSeeder`).

**Multi-tenancy**: All resources are scoped by `business_account_id`. The `users` table has a `business_account_id` FK. Controllers call `$request->user()->business_account_id` to scope queries. `DatabaseSeeder` creates two demo `BusinessAccount` rows and backfills the user. `ReservationSeeder` uses `insert` (not idempotent) — re-running it on a populated DB throws UNIQUE constraint on `booking_ref`; guard with the `.seeded` flag file.

**CORS** (`backend/config/cors.php`): allows only the origin in `FRONTEND_URL` (default `http://localhost:4200`).

---

## Design System

All styles use CSS custom properties defined in `src/styles/_tokens.scss`.

**Key tokens:**
- `--pc-primary` `#0e3b29` (dark green) — sidebar, primary buttons
- `--pc-accent` `#d4ff3a` (lime) — highlights, active states
- `--pc-ink` / `--pc-muted` — text colors
- `--pc-card` / `--pc-line` — surfaces and borders
- `--pc-success` / `--pc-warn` / `--pc-danger` / `--pc-info` — status colors

**Typography variables:** `--pc-display` (Bricolage Grotesque), `--pc-sans` (Geist), `--pc-mono` (JetBrains Mono).

**Global utility classes** (defined in `src/styles/_base.scss`): `.pc-btn`, `.pc-btn-primary`, `.pc-btn-ghost`, `.pc-card`, `.pc-badge`, `.pc-chip`, `.pc-dot`, `.pc-pulse`.

**SCSS convention**: BEM with component-specific prefixes. Feature components use their own prefix (`res-` for reservations, `sc-` for schedule, `dash-` for dashboard). Nested BEM with `&__element` and `&--modifier`.

---

## Data Models

**`Booking`** (`src/app/core/models/booking.model.ts`): `{ id, courtId, date, startHour, duration, type, name, players }`
- `BOOKING_TYPE_LABELS: Record<BookingType, string>` — Spanish display labels (`private` → `'Privada'`, etc.). Use instead of `TitleCasePipe`.

**`Reservation extends Booking`** (`reservation.model.ts`): adds `{ bookingRef, email, total, status, isOpen? }`
- `status`: `'paid' | 'pending' | 'partial' | 'refunded'`
- `id === bookingRef` (e.g. `'PD-8742'`) — this convention lets `BookingModalComponent` detect edit mode via `preset.id`
- `RESERVATION_STATUS_LABELS: Record<ReservationStatus, string>` — Spanish display labels (`paid` → `'Pagado'`, etc.). Use instead of `TitleCasePipe`.

**`ReservationVM extends Reservation`**: adds display fields `{ courtSurface, courtName, whenLabel, totalLabel, playersLabel, statusStyle }`

**`Court`** (`court.model.ts`): `{ id, surface: CourtSurface, location: CourtLocation, hasGlass }`

---

## Environment

**Angular** reads `src/environments/environment.ts`:
```typescript
export const environment = { production: false, apiUrl: 'http://localhost:8000' };
```

The production build uses `src/environments/environment.prod.ts` via `fileReplacements` in `angular.json`; it points to `https://canchas-padel.onrender.com`.

**Laravel** `.env` key settings: `DB_CONNECTION=sqlite`, `APP_URL=http://localhost:8000`, `SANCTUM_STATEFUL_DOMAINS=localhost:4200`.

---

## Production Deployment

**Stack**: GitHub (`main`) → Vercel (frontend) + Render (backend), both on free hosting.

| Service  | URL                                     |
|----------|-----------------------------------------|
| Frontend | https://tus-canchas-padel.vercel.app    |
| Backend  | https://canchas-padel.onrender.com      |

**Branch**: `main` is the only branch. Pushing to it deploys the frontend to Vercel automatically.

**Frontend (Vercel)**: runs the Angular production build. Project settings live in the Vercel dashboard (there is no `vercel.json` in the repo). Files in `public/` (favicon, `og.jpg`) are copied to the site root via `assets` in `angular.json`.

**Backend (Render)**: lives in `backend/` (`Dockerfile` + `docker-entrypoint.sh`, which runs migrations on start and seeds on first run). Service settings and env vars live in the Render dashboard. `FRONTEND_URL` must be `https://tus-canchas-padel.vercel.app`, because CORS only allows that origin.

### Known gotchas

- **Link preview**: the `og:` tags in `src/index.html` use absolute URLs; update them if the frontend URL changes.

- **Missing files return the app**: a nonexistent path such as `/missing.jpg` answers 200 with `index.html`, so check the `content-type` when verifying a static file.

- **Seeder idempotency**: `ReservationSeeder` uses raw `insert` and is not safe to re-run. The entrypoint writes a `.seeded` flag to `storage/db/` after the first successful seed.

- **SQLite persistence**: the database is a file inside the backend's `storage/db/`. Unless the Render service has a persistent disk mounted there, data is lost on redeploy or restart.

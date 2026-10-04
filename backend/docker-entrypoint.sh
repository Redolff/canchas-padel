#!/bin/sh
set -e

if [ ! -f .env ]; then
  cp .env.example .env
fi

# Inject supplied env vars into .env so Laravel/Dotenv can read them.
# Always overwrites — covers blank lines (APP_KEY=), commented lines, and missing keys.
for var in APP_ENV APP_DEBUG APP_URL APP_KEY FRONTEND_URL \
           SANCTUM_STATEFUL_DOMAINS SESSION_DOMAIN \
           DB_CONNECTION DB_DATABASE \
           LOG_CHANNEL LOG_LEVEL; do
  eval "val=\$$var"
  if [ -n "$val" ]; then
    if grep -q "^${var}=" .env 2>/dev/null; then
      sed -i "s|^${var}=.*|${var}=${val}|" .env
    else
      echo "${var}=${val}" >> .env
    fi
  fi
done

# Only generate a key when none is provided (avoids invalidating sessions on every restart)
if [ -z "$APP_KEY" ] && ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
  php artisan key:generate --force --no-interaction
fi

mkdir -p storage/db \
         storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache
touch storage/db/database.sqlite

# Run migrations (idempotent — safe to run every time)
php artisan migrate --force

# Seed only on first run (flag file prevents re-seeding on container restart)
if [ ! -f storage/db/.seeded ]; then
  php artisan db:seed --force
  touch storage/db/.seeded
fi

exec php artisan serve --host=0.0.0.0 --port=8000

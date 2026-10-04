# Padel Center — Admin Panel

Panel de administración para un club de pádel. Frontend Angular 18 + Backend Laravel 11, todo orquestado con Docker.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git

## Inicio rápido

```bash
# 1. Clonar el repositorio
git clone git@github.com:gamanuel/court-manager.git
cd court-manager

# 2. Levantar todo (la primera vez tarda ~2 min mientras descarga imágenes y compila)
docker compose up --build
```

Eso es todo. Al iniciar, el contenedor del backend automáticamente:
- Crea el archivo `.env`
- Genera la `APP_KEY`
- Crea la base de datos SQLite
- Corre las migraciones
- Siembra datos de prueba (25 reservas + usuario admin)

### URLs

| Servicio  | URL                        |
|-----------|----------------------------|
| Frontend  | http://localhost:4200       |
| Backend   | http://localhost:8000       |

### Credenciales de acceso

| Campo     | Valor                       |
|-----------|-----------------------------|
| Email     | `diego@padelcenter.com.ar`  |
| Contraseña| `admin123`                  |

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Abrir shell en el backend
docker compose exec backend sh

# Correr un comando Artisan
docker compose exec backend php artisan migrate:status

# Resetear la base de datos (borra todo y re-siembra)
docker compose exec backend sh -c "rm -f database/.seeded && php artisan migrate:fresh --seed --force && touch database/.seeded"

# Detener los contenedores
docker compose down
```

## Producción

El panel está desplegado en un VPS Hetzner usando **Dokploy** + **Cloudflare Tunnel**.

| Servicio  | URL                          |
|-----------|------------------------------|
| Frontend  | https://admin.clubpro.com.ar |
| Backend   | https://api.clubpro.com.ar   |

### Stack de producción

```
GitHub (branch: production)
  └── Dokploy (webhook auto-deploy)
        └── docker-compose.prod.yml
              ├── frontend  (nginx, puerto 80)
              └── backend   (Laravel, puerto 8000)
                    └── SQLite (Docker volume: sqlite_data)
        ↑
        Cloudflare Tunnel → admin.clubpro.com.ar / api.clubpro.com.ar
```

### Redesplegar manualmente (en el VPS)

```bash
cd /etc/dokploy/compose/courtmanage-front-hvreht/code
git pull
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### Variables de entorno del backend (Dokploy)

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.clubpro.com.ar
APP_KEY=<generada>
FRONTEND_URL=https://admin.clubpro.com.ar
SANCTUM_STATEFUL_DOMAINS=admin.clubpro.com.ar
SESSION_DOMAIN=.clubpro.com.ar
DB_CONNECTION=sqlite
DB_DATABASE=/var/www/database/database.sqlite
LOG_CHANNEL=stderr
LOG_LEVEL=error
```

---

## Estructura del proyecto

```
court-manager/
├── src/                  # Angular 18 frontend
│   ├── app/
│   │   ├── core/         # Servicios, modelos, interceptores
│   │   ├── features/     # Dashboard, Horario, Reservas, Login
│   │   └── shared/       # Componentes reutilizables
│   └── styles/           # Design tokens y estilos globales
├── backend/              # Laravel 11 API
│   ├── app/              # Controllers, Models, Resources
│   ├── database/         # Migraciones y seeders
│   └── routes/api.php    # Endpoints de la API
├── Dockerfile            # Imagen Angular (frontend)
├── backend/Dockerfile    # Imagen Laravel (backend)
└── docker-compose.yml    # Orquestación de servicios
```

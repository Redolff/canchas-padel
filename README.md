# Padel Center — Admin Panel

Panel de administración para un club de pádel. Frontend Angular 18 + Backend Laravel 11, todo orquestado con Docker.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Git

## Inicio rápido

 Al iniciar, el contenedor del backend automáticamente:
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

| Servicio  | URL                                     | Hosting |
|-----------|-----------------------------------------|---------|
| Frontend  | https://tus-canchas-padel.vercel.app    | Vercel  |
| Backend   | https://canchas-padel.onrender.com      | Render  |

### Cómo publicar cambios

Hacé commit y push a `main`. Vercel despliega el frontend automáticamente.

La URL de la API en producción está en `src/environments/environment.prod.ts`. La configuración de cada servicio (variables de entorno incluidas) está en los paneles de Vercel y Render. En Render, `FRONTEND_URL` tiene que ser la dirección del frontend, porque CORS solo permite ese origen.

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

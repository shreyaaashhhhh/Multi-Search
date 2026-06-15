# Render Deployment

This repo is configured for Render with `render.yaml` at the repository root.

## Services

- `multi-frontend`: React/Vite static site
- `multi-gateway`: FastAPI public API gateway
- `multi-core-service`: Spring Boot service, built with Docker
- `multi-task-service`: Node/Express task service
- `multi-postgres`: Render Postgres database for the Spring service

## Deploy

1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repo.
3. Render will detect `render.yaml`.
4. When prompted, set these secrets:
   - `SECRETE_KEY`: use the same JWT secret for `multi-core-service` and `multi-task-service`.
   - `DBURL`: MongoDB connection string for `multi-task-service`.
5. Apply the Blueprint.

## URLs

The Blueprint assumes these Render service URLs:

- Frontend: `https://multi-frontend.onrender.com`
- Gateway: `https://multi-gateway.onrender.com`

If Render changes a service subdomain during creation, update:

- `multi-gateway` env var `CORS_ORIGINS`
- `multi-frontend` env var `VITE_API_BASE_URL`

## Local Defaults

Local development still defaults to:

- Frontend: `http://localhost:5173`
- Gateway: `http://localhost:8000`
- Spring core: `http://localhost:8001`
- Node task service: `http://localhost:8002`

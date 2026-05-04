# Medico

Medico is a MERN-style doctor and clinic appointment booking system:

- `frontend/`: React + Vite client UI (Tailwind + MUI where used)
- `server/`: Express + MongoDB API
- `docker-compose.yml`: optional local full-stack setup

The project is split into `frontend/` and `server/`; keep application code there, not in the repository root.

## What this project is used for

Medico supports a healthcare booking workflow where users can:

- **Sign in** with email/password (JWT in HttpOnly cookies) or **continue with Google** (full-page OAuth redirect)
- **Register** as a patient; **request a doctor account** (pending admin approval) with verification details
- **Change password** when required (e.g. first login after admin setup)
- **Browse** facilities/clinics and linked doctors
- **Book appointments** with reason, date, mode (in-person / video / chat), and time slot — slots are grouped (morning / evening / night), show free vs booked counts, and booked intervals are visible but disabled
- **View** appointment history and status (user, doctor, and admin views where implemented)

Admins can review doctor requests, manage facilities/doctors, and handle appointments as provided by the current routes.

## How it works (end-to-end)

1. User opens the React app (`frontend`, default dev port `3001`).
2. Frontend calls the API through `api.service.js` (`VITE_API_URL`, default `http://localhost:3000/api`).
3. API authenticates using JWT stored in HttpOnly cookies (`accessToken`, `refreshToken`).
4. Protected API routes use auth middleware to validate the token and role.
5. Controllers implement business logic and read/write MongoDB models.
6. Appointment actions can trigger email notifications (confirmation / request flow), depending on configuration.

### API documentation (Swagger)

With the API server running, open **Swagger UI** at:

- [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Raw **OpenAPI 3** JSON: [http://localhost:3000/api/docs/openapi.json](http://localhost:3000/api/docs/openapi.json)  
The machine-readable spec lives in `server/docs/openapi.spec.js` (edit there, then reload the docs page).

## Current architecture

- **Frontend (`frontend/src`)**
  - `pages/`, `components/`, `routes/`, `store/`, `context/`, `services/`
  - Auth-aware routing and guards in `App.jsx` / route modules
  - Axios instance + token refresh interceptor in `services/api.service.js`

- **Backend (`server`)**
  - `routes/` → `controllers/` → `models/`
  - `middlewares/auth.middleware.js` for cookie/JWT protection
  - `config/` for DB, logger, mail, uploads
  - Static uploads served from `/uploads`

## Recommended folder discipline

- Keep all React code inside `frontend/`.
- Keep all Express/Mongo code inside `server/`.
- Use the repository root for orchestration (`README`, `docker-compose.yml`, top-level npm scripts).
- Keep environment files out of git; use `.env.example` files as templates.

## Run locally

1. Install dependencies
   - `cd frontend && npm install`
   - `cd server && npm install`

2. Environment
   - Server: copy `server/.env.example` to **root** `.env` (or follow your team’s convention) and set values (MongoDB, JWT, mail, `FRONTEND_URL`, OAuth client IDs if using Google, etc.).
   - Frontend (optional): copy `frontend/.env.example` to `frontend/.env` for `VITE_API_URL` overrides.

3. Start
   - MongoDB on `27017`
   - API: `cd server && npm start`
   - Frontend: `cd frontend && npm run dev` → `http://localhost:3001`

From root (separate terminals): `npm run start:server` and `npm run dev`.

## Run with Docker

1. Copy `server/.env.example` to root `.env` and fill secrets (including anything the server expects for auth and mail).
2. Run: `docker compose up --build`
3. Open:
   - Frontend: `http://localhost` (port `80` mapped in `docker-compose.yml`)
   - API: `http://localhost:3000`

## Root scripts

- `npm run dev` — start frontend dev server
- `npm run dev:frontend` — explicit frontend dev command
- `npm run build` — build frontend
- `npm run start:server` — start API server
- `npm run health` — check API health endpoint
- `npm run install:all` — install dependencies in root/frontend/server
- `npm run docker:up` / `npm run docker:down` — start/stop Docker stack

## Production readiness checklist

- Set `NODE_ENV=production` in deployment environment.
- Set `FRONTEND_URL` to your real client URL (or comma-separated URLs if your stack supports that).
- Use strong JWT secrets and rotate them periodically.
- Keep production secrets out of git; inject via your hosting platform.
- Ensure HTTPS in production so secure cookies (`Secure`, `SameSite=None`) behave as intended.
- Monitor `/health` and container restarts for uptime checks.

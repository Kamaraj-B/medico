# Medico

Medico is a MERN-style doctor and clinic appointment booking system:

- `frontend/`: React + Vite client UI
- `server/`: Express + MongoDB API
- `docker-compose.yml`: optional local full-stack setup

The project is already correctly split into frontend and backend folders.

## What this project is used for

Medico supports a healthcare booking workflow where users can:

- Sign in using Google OAuth
- Browse facilities/clinics and doctors
- Book appointments with date/time/mode
- View appointment history and status
- Use profile and communication pages (chat/video sections in UI)

It also supports admin/doctor style workflows such as facility management and appointment handling.

## How it works (end-to-end)

1. User opens the React app (`frontend`, default dev port `3001`).
2. Frontend calls API through `api.service.js` (`VITE_API_URL`, default `http://localhost:3000/api`).
3. API authenticates users using JWT stored in HttpOnly cookies (`accessToken`, `refreshToken`).
4. Protected API routes use auth middleware to validate the token and role.
5. Controllers process business logic and read/write MongoDB models.
6. Appointment actions trigger email notifications (confirmation/request flow).

## Current architecture

- **Frontend (`frontend/src`)**
  - `pages/`, `components/`, `routes/`, `store/`, `context/`, `services/`
  - Auth-aware route switching in `App.jsx`
  - Axios instance + token refresh interceptor in `services/api.service.js`

- **Backend (`server`)**
  - `routes/` -> `controllers/` -> `models/`
  - `middlewares/auth.middleware.js` for cookie/JWT protection
  - `config/` for DB, logger, mail, uploads
  - static uploads served from `/uploads`

## Recommended folder discipline

To keep the repo clean going forward:

- Keep all React code only inside `frontend/`.
- Keep all Express/Mongo code only inside `server/`.
- Do not place app code in repository root.
- Use root only for orchestration (`README`, `docker-compose.yml`, top-level scripts).
- Keep a single root `.env` as source of truth for backend secrets (current setup), never commit secrets.

## Run locally

1. Install dependencies
   - `cd frontend && npm install`
   - `cd server && npm install`

2. Environment
   - Server: copy `server/.env.example` to root `.env`, then set values.
   - Frontend (optional): copy `frontend/.env.example` to `frontend/.env`.

3. Start
   - MongoDB on `27017`
   - API: `cd server && npm start`
   - Frontend: `cd frontend && npm run dev` -> `http://localhost:3001`

From root (separate terminals): `npm run start:server` and `npm run dev`.

## Run with Docker

1. Copy `server/.env.example` to root `.env` and fill secrets.
2. Run: `docker compose up --build`
3. Open:
   - Frontend: `http://localhost`
   - API: `http://localhost:3000`

## Root scripts

- `npm run dev` - start frontend dev server
- `npm run dev:frontend` - explicit frontend dev command
- `npm run build` - build frontend
- `npm run start:server` - start API server
- `npm run health` - check API health endpoint
- `npm run install:all` - install dependencies in root/frontend/server
- `npm run docker:up` / `npm run docker:down` - start/stop Docker stack

## Production readiness checklist

- Set `NODE_ENV=production` in deployment environment.
- Set `FRONTEND_URL` to your real client URL (or comma-separated URLs for multiple environments).
- Use strong JWT secrets and rotate them periodically.
- Keep root `.env` out of git and inject secrets via deployment platform.
- Ensure HTTPS is enabled in production so secure cookies (`Secure`, `SameSite=None`) work correctly.
- Monitor `/health` endpoint and container restarts for uptime checks.

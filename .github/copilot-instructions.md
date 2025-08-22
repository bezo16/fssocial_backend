# Social Platform Full Stack Project Guide

## Table of Contents
- [Quick Orientation](#quick-orientation)
- [High-level Architecture](#high-level-architecture)
- [Developer Workflows & Commands](#developer-workflows--commands)
- [Important Environment Variables](#important-environment-variables)
- [Project-specific Conventions & Gotchas](#project-specific-conventions--gotchas)
- [Files to Inspect](#files-to-inspect-for-common-patterns-examples)
- [Making Safe Changes](#how-to-make-safe-automated-changes)
- [Example Code Snippets](#example-code-snippets-search-targets)
- [Troubleshooting](#troubleshooting)

## Quick orientation

This repository is a two-part app: a NestJS backend (backend/) and a Next.js frontend (frontend/).

- Backend: NestJS (TypeScript), Drizzle ORM + Postgres, static files served from `backend/public`.
- Frontend: Next.js (app router), React + Chakra UI, uses `NEXT_PUBLIC_API_URL` to call the backend.

Read the files below to learn the patterns used: `backend/src/**`, `backend/lib/**`, `frontend/app/**`, `frontend/lib/**`.

## High-level architecture

- Backend (API): controllers in `backend/src/*/*.controller.ts`, services in `backend/src/*/*.service.ts`.
  - DB access centralised via `backend/lib/drizzle/index.ts` which instantiates Drizzle with `process.env.DATABASE_URL`.
  - Drizzle schema lives at `backend/lib/drizzle/schema.ts` and is used across services (e.g. `usersTable`, `postsTable`).
  - Static assets (avatars) served by Nest using `ServeStaticModule` from `backend/public`.

- Auth flow:
  - JWTs are verified server-side by the custom `JwtAuthGuard` in `backend/lib/auth/JwtAuthGuard.ts`.
  - Guard expects a raw token string in the `Authorization` header (no `Bearer ` prefix).
  - Frontend stores token in localStorage and attaches it via an Axios interceptor in `frontend/lib/api/axiosApiCall.ts`.

- File uploads:
  - Multer disk storage is configured in `backend/lib/multer/pfpStorage.ts` with destination `./public/avatars`.
  - Avatar upload endpoint: `POST /users/me/avatar` (see `backend/src/users/users.controller.ts`), guarded by `JwtAuthGuard`.

## Developer workflows & commands

- Backend (from `backend/`):
  - Install: `npm install`
  - Dev: `npm run start:dev` (Nest watch mode)
  - Build: `npm run build`
  - Run prod: `npm run start:prod` (runs `node dist/main`)
  - Tests: `npm run test`, e2e: `npm run test:e2e` (see `test/jest-e2e.json`)

- Frontend (from `frontend/`):
  - Install: `npm install`
  - Dev: `npm run dev` (Next dev server)
  - Build & start: `npm run build` && `npm run start`

- Database & migrations:
  - Drizzle config: `backend/drizzle.config.ts`. It reads `DATABASE_URL` from env.
  - Generate migrations: `npm run drizzle:generate` (creates SQL based on schema changes)
  - Apply migrations: `npm run drizzle:push` (updates DB schema)
  - Use `drizzle-kit` (installed) for migrations; check the generated `drizzle` output.

## Important environment variables

- Backend (examples):
  - `DATABASE_URL` — Postgres connection string used by Drizzle (required).
  - `JWT_SECRET` — secret used by `JwtService` for signing/verifying JWTs.
  - `PORT` — optional, defaults to `4000`.
  - `FRONTEND_URL` — used for CORS origin in `main.ts`.

- Frontend:
  - `NEXT_PUBLIC_API_URL` — base URL used by the Axios client (e.g. `http://localhost:4000`).

## Project-specific conventions & gotchas

- JwtAuthGuard expects the token exactly as stored in `localStorage` and attached to the `Authorization` header by the frontend code; there is no `Bearer ` prefix handling. If you change the frontend format, update `JwtAuthGuard` accordingly.

- File paths: uploaded avatars are written to `backend/public/avatars` and served by Nest's static server; the frontend constructs image URLs like `${process.env.NEXT_PUBLIC_API_URL}${avatarUrl}` (see `frontend/components/common/ProfilePicture.tsx`).

- Drizzle usage: services import the tables from `backend/lib/drizzle/schema` and call `db` exported by `backend/lib/drizzle/index.ts`. Use `eq`, `sql`, and other helpers from `drizzle-orm` as shown in `src/*/*.service.ts`.

- Request user shape: the `JwtAuthGuard` assigns `request.user` to the decoded `User` object from the token — controllers rely on `request.user?.id` (see `backend/src/users/users.controller.ts`). Keep the token payload shape aligned with the `User` used across code.

## Files to inspect for common patterns (examples)

- Auth: `backend/lib/auth/JwtAuthGuard.ts`, `backend/src/auth/auth.controller.ts`, `frontend/lib/auth/verifyJwtToken.ts`, `frontend/middleware.ts`.
- DB: `backend/lib/drizzle/index.ts`, `backend/lib/drizzle/schema.ts`, `backend/src/*/*.service.ts` (e.g. `posts.service.ts`, `users.service.ts`).
- Uploads: `backend/lib/multer/pfpStorage.ts`, `backend/src/users/users.controller.ts`, `frontend/components/users/EditAvatarSection.tsx`.
- HTTP client: `frontend/lib/api/axiosApiCall.ts` (interceptor attaches token from localStorage and requests use `withCredentials: true`).

## How to make safe automated changes

- Small fixes: prefer editing controllers/services. Running the backend unit tests (`npm run test`) and frontend tests (`npm run test`) should be done after changes.
- For auth or token format changes: update both `frontend/lib/api/axiosApiCall.ts` and `backend/lib/auth/JwtAuthGuard.ts` together.
- For uploads: keep multer destination in sync with the `ServeStaticModule` root path in `backend/src/app.module.ts`.

## Example code snippets (search targets)

- Look for `request.user?.id` (controllers depend on it).
- Look for `process.env.NEXT_PUBLIC_API_URL` in frontend to find where absolute URLs are formed.
- `FileInterceptor('file', { storage: pfpStorage })` indicates upload endpoints.

## Troubleshooting

- Authentication issues: Verify the `JWT_SECRET` is consistent and token formatting matches between frontend and backend
- Database connection errors: Check that `DATABASE_URL` is correct and the Postgres server is running
- Missing avatars: Ensure the `backend/public/avatars` directory exists and has proper permissions
- CORS errors: Verify `FRONTEND_URL` in backend matches the actual frontend origin URL
- API connection failures: Check that `NEXT_PUBLIC_API_URL` points to the running backend

---
If any of these areas are unclear or you want the instructions expressed differently (shorter, or with more examples), tell me which sections to expand and I'll iterate.
# Booktrack

App personal de lista de lectura con auto-fetch de datos desde Open Library.

## Commands

- `npm run dev` — Servidor de desarrollo en http://localhost:3000
- `npm run build` — Build de producción
- `npm run lint` — ESLint
- `npx drizzle-kit push` — Sincronizar schema con Supabase
- `npx drizzle-kit generate` — Generar migraciones desde schema

## Tech Stack

Next.js 15 (App Router) + TypeScript strict + Tailwind CSS v4 + shadcn/ui + Supabase/Drizzle + iron-session + Open Library API + Vercel

## Critical Next.js Notes

- `params` y `searchParams` en pages/layouts/route handlers son **Promises** — siempre `await` them
- Route handler context: `{ params }: { params: Promise<{ id: string }> }` → `const { id } = await params`

## Architecture

Single-user app. Una tabla `books` en Supabase. Auth via cookie (iron-session). Sin API key externa.

### Key conventions
- Server Components por defecto — `'use client'` solo para componentes interactivos
- Filtros en URL search params (`?genre=fiction&status=to_read&view=grid`)
- Mutaciones via `fetch` a API routes + `router.refresh()`
- Llamadas a Open Library siempre via `/api/openlibrary/*` — centraliza la transformación de datos

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase connection string (Transaction pooler) |
| `APP_PASSWORD` | Login password for the app |
| `SESSION_SECRET` | iron-session encryption key (min 32 chars) |

## Design System

Dark literario. Background `#0A0A0F`, accent `#C8956C` (ámbar cálido), fonts DM Sans + Playfair Display.
CSS variables en `globals.css`: `--background`, `--surface`, `--surface-raised`, `--border`, `--primary`, etc.

## Reglas No Negociables

1. TypeScript strict mode. Cero `any`.
2. Todos los colores del design system desde CSS variables — nunca hex hardcodeado.
3. Imágenes de Open Library via next/image con dominio `covers.openlibrary.org` whitelisted.
4. Filtros en URL search params — nunca estado client-side para filtros.
5. Un componente por archivo. Máximo 300 líneas.
6. Mobile-first. Grid empieza en 2 columnas (mobile) → 6 (xl).

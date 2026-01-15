# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proxed.AI is a secure proxy backend for iOS apps that protects AI API keys and controls AI responses. It uses Apple's DeviceCheck for security verification and provides a visual schema builder for structured AI outputs.

## Architecture

This is a **monorepo** using Turborepo with Bun as the runtime and package manager.

### Apps

- **api** (`apps/api/`): Core proxy service using Hono framework on Bun runtime. Handles AI provider proxying (OpenAI, Anthropic, Google AI), DeviceCheck verification, rate limiting, and usage tracking.
- **app** (`apps/app/`): Next.js 15 customer dashboard with Supabase auth for managing API keys, schemas, and billing.
- **web** (`apps/web/`): Marketing/landing website built with Next.js 15.
- **docs** (`apps/docs/`): Documentation site using Fumadocs.

### Packages

- **db** (`packages/db/`): Drizzle ORM schemas for direct PostgreSQL access (used by proxy)
- **supabase** (`packages/supabase/`): Supabase client wrappers, RLS-based queries, and session management
- **ui** (`packages/ui/`): Shared UI components using Shadcn/ui
- **structure** (`packages/structure/`): Schema parser/generator for structured AI responses (Zod-based)
- **jobs** (`packages/jobs/`): Background job implementations using Trigger.dev v3
- **mail** (`packages/mail/`): Email templates with React Email + Resend
- **kv** (`packages/kv/`): Upstash Redis client wrapper
- **logger** (`packages/logger/`): Pino-based logging utility
- **analytics** (`packages/analytics/`): OpenPanel analytics integration
- **notifications** (`packages/notifications/`): Novu integration for in-app notifications
- **location** (`packages/location/`): IP geolocation helpers and country/region metadata
- **utils** (`packages/utils/`): Shared low-level utilities

## Commands

```bash
# Development
bun run dev              # Run all apps in parallel
bun run dev:web         # Marketing site only
bun run dev:app         # Dashboard only
bun run dev:api         # Proxy API only
bun run dev:trigger     # Trigger.dev task runner
bun run dev:email       # Email template preview

# Build & Quality
bun run build           # Build all apps
bun run lint            # Biome linter + manypkg check
bun run format          # Format code with Biome
bun run typecheck       # TypeScript type checking

# Testing (Bun's built-in runner)
bun test                         # Run all tests
bun test --watch                # Watch mode
bun test path/to/file.test.ts   # Run specific file

# Database (Supabase)
bun run supabase:start          # Start local Supabase
bun run supabase:reset          # Reset database
bun run supabase:migrate        # Run migrations
bun run supabase:migration:create  # Create new migration
bun run supabase:generate       # Generate TypeScript types

# Dependencies
bun run update:all      # Update all workspace dependencies
```

## Key Implementation Patterns

### Authentication
- Dashboard uses Supabase Auth with `@supabase/ssr` (NOT deprecated `@supabase/auth-helpers-nextjs`)
- Use shared clients: `@proxed/supabase/server`, `@proxed/supabase/client`, `@proxed/supabase/middleware`
- Cookie integration must use **only** `getAll`/`setAll` (not `get`/`set`/`remove`)
- Proxy API uses API key authentication with DeviceCheck verification

### Database Access
- **Proxy app**: Drizzle ORM with direct PostgreSQL connection (`@proxed/db`)
- **Dashboard app**: Supabase client with Row Level Security (RLS) (`@proxed/supabase`)
- Database types generated at `packages/supabase/src/types/db.generated.ts`
- Supabase project location: `packages/supabase/supabase/`
  - Migrations: `packages/supabase/supabase/migrations/`
  - Schemas: `packages/supabase/supabase/schemas/`
  - Functions: `packages/supabase/supabase/functions/`

### RLS Guidelines
- Prefer `snake_case` for tables/columns
- Enable RLS on new tables with explicit policies (avoid `FOR ALL`; separate select/insert/update/delete)
- Default to `security invoker`. If using `security definer`, set explicit `search_path` and fully-qualify objects

### Server Actions (Dashboard)
- Use `next-safe-action` with Zod validation
- Use `authActionClient` for authenticated actions
- Return structured responses with proper error handling

### State Management
- URL state: `nuqs` for search params
- Client state: Zustand for complex state, Jotai for atoms
- Form state: React Hook Form with Zod validation

### Trigger.dev (Background Jobs)
- Task implementations live in `packages/jobs` (import via `@proxed/jobs`)
- Re-export tasks from `apps/app/jobs/*` (Trigger config uses `dirs: ["jobs"]`)
- Use `@trigger.dev/sdk/v3` APIs only (never v2)
- Prefer `schemaTask` with Zod for payload validation
- Avoid `triggerAndWait` in request/response paths; prefer fire-and-forget
- Run locally with `bun run dev:trigger`

### Testing
- Co-locate tests near the code being tested
- For bug fixes: add a failing test first, then fix
- Keep tests deterministic: use fixtures/mocks instead of real network calls

## Critical Rules

1. **Use React Server Components by default** - add `"use client"` only when necessary
2. **API app uses Hono**, not Next.js - keep them distinct
3. **Use workspace imports**: `@proxed/ui`, `@proxed/supabase`, etc. - no deep relative imports across workspaces
4. **Never expose secrets** - all AI provider calls must go through the proxy
5. **Use RLS** when accessing Supabase from client components
6. **Trigger.dev v3 only** - never use v2 APIs
7. **Validate DeviceCheck** for all iOS API requests in the proxy
8. **Prefer complete implementations** over workarounds or quick patches
9. **Keep existing behavior intact** unless explicitly asked to remove/rename

## Project Structure Patterns

```
apps/api/src/
├── rest/routes/        # API endpoints by feature
├── rest/middleware/    # Auth, CORS, rate limiting
├── trpc/              # Internal RPC for dashboard
└── utils/             # Provider proxies, errors, logger

apps/app/src/
├── app/[locale]/      # App Router with i18n
├── actions/           # Server actions (authActionClient)
├── components/        # UI components
└── trpc/              # Client-side tRPC queries

apps/app/jobs/         # Trigger.dev task re-exports

packages/db/
├── src/schema.ts      # Drizzle table definitions
├── src/client.ts      # Database client with replicas
└── src/queries/       # Typed query helpers

packages/supabase/
├── supabase/migrations/  # SQL migrations
├── supabase/schemas/     # SQL schema files
├── supabase/functions/   # Edge functions
├── src/clients/          # Server, client, middleware
├── src/queries/          # RLS-safe cached queries
└── src/types/            # Generated db.generated.ts
```

## Environment Variables

Each app has its own `.env.local`. Key variables:
- `DATABASE_URL`: PostgreSQL connection (proxy)
- `SUPABASE_URL` & `SUPABASE_ANON_KEY`: Dashboard
- `RESEND_API_KEY`: Email sending
- `TRIGGER_SECRET_KEY`: Background jobs
- AI provider keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`

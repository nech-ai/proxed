# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Proxed.AI is a secure proxy backend for iOS apps that protects AI API keys and controls AI responses. It uses Apple's DeviceCheck for security verification and provides a visual schema builder for structured AI outputs.

## Architecture

This is a **monorepo** using Turborepo with Bun as the runtime and package manager.

### Apps

- **proxy** (`apps/proxy/`): Core API service using Hono framework on Bun runtime. Handles AI provider proxying, DeviceCheck verification, and rate limiting.
- **app** (`apps/app/`): Next.js 15 customer dashboard with Supabase auth for managing API keys and schemas
- **web** (`apps/web/`): Marketing/landing website built with Next.js 15
- **api** (`apps/api/`): Supabase database configuration and migrations
- **docs** (`apps/docs/`): Documentation site using Fumadocs

### Packages

- **ui** (`packages/ui/`): Shared UI components using Shadcn/ui
- **supabase** (`packages/supabase/`): Supabase client and database queries
- **mail** (`packages/mail/`): Email templates and sending with React Email + Resend
- **structure** (`packages/structure/`): Schema parser/generator for structured AI responses
- **jobs** (`packages/jobs/`): Background jobs using Trigger.dev v3
- **utils** (`packages/utils/`): Shared utilities and constants

## Commands

```bash
# Development
bun run dev              # Run all apps in parallel
bun run dev:web         # Run marketing site only
bun run dev:app         # Run dashboard only
bun run dev:api         # Run API/proxy only

# Build & Quality
bun run build           # Build all apps
bun run lint            # Run Biome linter
bun run format          # Format code with Biome
bun run typecheck       # Type checking across all packages

# Testing
bun test                # Run all tests
bun test --watch       # Run tests in watch mode

# Database (Supabase)
bun run supabase:start   # Start local Supabase
bun run supabase:reset   # Reset database
bun run supabase:migrate # Run migrations
bun run supabase:generate # Generate TypeScript types

# Dependencies
bun run update:all      # Update all dependencies
```

## Key Implementation Patterns

### Authentication
- Dashboard uses Supabase Auth with `@supabase/ssr` (NOT deprecated auth helpers)
- Proxy API uses API key authentication with DeviceCheck verification
- Always validate user permissions in server actions using `requireUser()` pattern

### Database Access
- **Proxy app**: Uses Drizzle ORM with direct PostgreSQL connection
- **Dashboard app**: Uses Supabase client with Row Level Security (RLS)
- Database types are generated in `@proxed/supabase/types`

### Server Actions
- Use `next-safe-action` with Zod validation
- Always check user permissions before database operations
- Return structured responses with proper error handling

### State Management
- URL state: `nuqs` library for search params
- Client state: Zustand for complex state, Jotai for atoms
- Form state: React Hook Form with Zod validation

### API Development
The proxy app (`apps/proxy/`) is the core service:
- Built with Hono framework (NOT Next.js)
- Handles AI provider proxying (OpenAI, Anthropic, Google AI)
- Implements rate limiting and usage tracking
- Validates structured responses against user-defined schemas

### Testing
Use Bun's built-in test runner:
```bash
# Run specific test file
bun test path/to/test.test.ts

# Run tests matching pattern
bun test --preload ./test/setup.ts auth
```

## Critical Rules

1. **Always use React Server Components by default** - only use client components when necessary
2. **Proxy app uses Hono**, not Next.js - don't confuse the two
3. **Use workspace imports**: `@proxed/ui`, `@proxed/supabase`, etc.
4. **Never expose API keys** - all AI provider calls must go through the proxy
5. **Always use RLS** when accessing Supabase from client components
6. **Use Trigger.dev v3** for background jobs (not v2)
7. **Validate DeviceCheck** for all iOS API requests in the proxy

## Project Structure Patterns

- Migrations: `apps/api/supabase/migrations/`
- Database schemas: `apps/api/supabase/schemas/`
- Shared types: `packages/*/src/types.ts`
- API routes (proxy): `apps/proxy/src/routes/`
- Dashboard routes: `apps/app/app/` (App Router)

## Environment Variables

Each app has its own `.env.local` file. Key variables:
- `DATABASE_URL`: PostgreSQL connection for proxy
- `SUPABASE_URL` & `SUPABASE_ANON_KEY`: For dashboard
- `RESEND_API_KEY`: Email sending
- `TRIGGER_SECRET_KEY`: Background jobs
- AI provider keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.
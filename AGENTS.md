# AGENTS.md

## Before any task
CRITICAL: Read `docs/CONTEXT_APP` at the start of every conversation before taking any action.
This file contains the project requirements, specifications, Figma prototypes, and evaluation criteria.

## Repo Shape
- pnpm workspace, package manager pinned as `pnpm@10.32.1` in root `package.json`.
- Workspace packages are `apps/*` and `packages/**/*`; `packages/` is currently empty.
- Frontend is `apps/frontend`: React 19 + Vite 8 entrypoint `src/main.tsx`, app component `src/App.tsx`.
- Backend is `apps/backend`: NestJS 11 entrypoint `src/main.ts`, root module `src/app.module.ts`, listens on `process.env.PORT ?? 3000`.
- Project OpenCode config is `opencode.json`; it enables the remote Prisma MCP server at `https://mcp.prisma.io/mcp` and may require Prisma Console auth on first use.

## Commands
- Install from repo root with `pnpm install`.
- Root `pnpm dev`, `pnpm build`, and `pnpm start` run matching scripts across workspace packages in parallel.
- Root `pnpm test` is a placeholder that exits 1; run package tests with filters instead.
- Frontend: `pnpm --filter frontend dev`, `pnpm --filter frontend build`, `pnpm --filter frontend lint`.
- Backend: `pnpm --filter backend start:dev` for watch mode, `pnpm --filter backend build`, `pnpm --filter backend test`, `pnpm --filter backend test:e2e`.
- Backend Prisma: `pnpm --filter backend prisma:generate`, `pnpm --filter backend prisma:migrate --name <name>`, `pnpm --filter backend prisma:studio`.
- Pass Jest flags without an extra separator: use `pnpm --filter backend test --runInBand`, not `pnpm --filter backend test -- --runInBand`.
- Run a focused backend spec with `pnpm --filter backend test -- app.controller.spec.ts` or `pnpm --filter backend exec jest path/to/spec.ts`.

## Verification Notes
- Frontend has no test script; `build` runs `tsc -b && vite build`.
- Backend unit Jest config lives inside `apps/backend/package.json` with `rootDir: "src"`; e2e tests use `apps/backend/test/jest-e2e.json`.
- Prisma schema lives at `apps/backend/prisma/schema.prisma`; generated client goes to ignored `apps/backend/src/generated/prisma` and `build` regenerates it first.
- Backend `lint` runs ESLint with `--fix`, so it may modify files; frontend `lint` is check-only.
- Backend ESLint is type-aware via `projectService: true` and includes Prettier as an ESLint rule.

## Generated Outputs
- Frontend build output is `apps/frontend/dist/`.
- Backend build output is `apps/backend/dist/`.

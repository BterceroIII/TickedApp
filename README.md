# TickedApp

Portal de cliente para agencias: gestión de proyectos, tickets, facturas y comunicación con Odoo.

## Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: React 19, Vite 8, TanStack Router, TanStack Query, Tailwind CSS 4, shadcn/ui
- **Backend**: NestJS 11, Prisma 7, PostgreSQL, Passport JWT, Swagger
- **Auth**: JWT con refresh tokens y cookies HTTP-only
- **Infra**: Docker Compose (PostgreSQL), Node.js 22+

## Estructura

```
TickedApp/
├── apps/
│   ├── frontend/       # React SPA (Vite)
│   └── backend/        # API REST (NestJS + Prisma)
├── docs/               # Documentación del proyecto
└── pnpm-workspace.yaml
```

## Desarrollo

```bash
pnpm install               # Instalar dependencias
pnpm --filter backend dev  # Backend en http://localhost:3000
pnpm --filter frontend dev # Frontend en http://localhost:5173
# o ambos:
pnpm dev                   # Ejecuta ambos en paralelo
```

## Prisma

```bash
pnpm --filter backend prisma:migrate --name <nombre>
pnpm --filter backend prisma:generate
pnpm --filter backend prisma:studio
```

## Testing

```bash
pnpm --filter backend test          # Unit tests (Jest)
pnpm --filter backend test --runInBand
pnpm --filter backend test:e2e
```

## Integración Odoo

Ver [`docs/ODOO_INTEGRATION.md`](docs/ODOO_INTEGRATION.md).


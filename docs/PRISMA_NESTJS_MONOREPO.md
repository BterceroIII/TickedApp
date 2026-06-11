# Instalar Prisma en NestJS dentro de un monorepo pnpm

Guía basada en la documentación oficial de Prisma para NestJS: https://www.prisma.io/docs/guides/frameworks/nestjs

## Supuestos
- Monorepo con `pnpm-workspace.yaml` y una app NestJS en `apps/backend`.
- Prisma vive dentro del paquete backend, no en la raíz del monorepo.
- Base de datos PostgreSQL con `DATABASE_URL` en `apps/backend/.env`.

## 1. Instalar dependencias en el paquete NestJS

Desde la raíz del monorepo:

```bash
pnpm --filter backend add @prisma/client @prisma/adapter-pg pg @nestjs/config
pnpm --filter backend add -D prisma
```

Para otra base de datos, cambia `@prisma/adapter-pg` y `pg` por el adapter/driver correspondiente.

## 2. Inicializar Prisma dentro del backend

```bash
pnpm --filter backend exec prisma init --output ../src/generated/prisma
```

Esto crea:
- `apps/backend/prisma/schema.prisma`
- `apps/backend/prisma.config.ts`
- una entrada `DATABASE_URL` en `apps/backend/.env`

## 3. Configurar el schema

En `apps/backend/prisma/schema.prisma`:

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}
```

`moduleFormat = "cjs"` evita problemas con Jest/CommonJS en proyectos NestJS que usan `ts-jest`.

## 4. Agregar scripts al backend

En `apps/backend/package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && nest build",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

## 5. Crear `PrismaService`

En `apps/backend/src/prisma.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({ adapter });
  }
}
```

## 6. Crear y registrar `PrismaModule`

En `apps/backend/src/prisma.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

Luego importa el módulo en `apps/backend/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
})
export class AppModule {}
```

Mantén también tus controllers, providers e imports existentes en el módulo.

## 7. Configurar variables de entorno

Ejemplo para `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:15432/ticked_app_db?schema=public"
```

No commitees `.env`; usa `.env.example` para documentar las variables requeridas.

## 8. Generar cliente y migrar

Generar Prisma Client:

```bash
pnpm --filter backend prisma:generate
```

Crear/aplicar migración cuando ya tengas modelos y una DB disponible:

```bash
pnpm --filter backend prisma:migrate --name init
```

Abrir Prisma Studio:

```bash
pnpm --filter backend prisma:studio
```

## 9. Ajuste para Jest con Prisma 7

Si el cliente generado importa archivos relativos con extensión `.js`, agrega esto a la configuración de Jest y e2e:

```json
{
  "moduleNameMapper": {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
}
```

## Verificación recomendada

```bash
pnpm --filter backend build
pnpm --filter backend test --runInBand
pnpm --filter backend test:e2e
```

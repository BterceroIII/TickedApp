# Integracion Odoo En TickedApp

Esta integracion demuestra que el portal cliente puede crear informacion en Odoo sin reemplazarlo. TickedApp funciona como una capa externa amigable para clientes, mientras Odoo sigue siendo el sistema interno de gestion.

## Flujo Implementado

```text
Frontend TickedApp
  -> Backend NestJS
  -> Base de datos local
  -> Odoo External JSON-2 API
  -> Odoo Proyectos / Helpdesk
```

Cuando se crea un proyecto o ticket en TickedApp, el backend primero guarda el registro localmente. Despues intenta sincronizarlo con Odoo.

## Variables De Entorno

El backend requiere estas variables:

```env
ODOO_URL=https://tu-instancia.odoo.com
ODOO_DATABASE=tu-base-de-datos
ODOO_API_KEY=tu-api-key
```

Estas variables estan documentadas en `apps/backend/.env.example`.

## Archivos Principales

```text
apps/backend/src/common/config/odoo.config.ts
apps/backend/src/common/services/odoo.service.ts
apps/backend/src/common/common.module.ts
apps/backend/src/projects/projects.service.ts
apps/backend/src/tickeds/tickeds.service.ts
```

## Creacion De Proyectos

Endpoint de TickedApp:

```text
POST /api/v1/projects
```

Flujo:

```text
ProjectsService.create()
  -> crea proyecto local con Prisma
  -> envia project.project/create a Odoo
```

Payload enviado a Odoo:

```json
{
  "vals_list": [
    {
      "name": "Nombre del proyecto",
      "description": "Descripcion del proyecto",
      "date_start": "2026-06-13",
      "date": "2026-06-30",
      "user_id": 9
    }
  ]
}
```

`date_start` usa `createdAt` como inicio planeado y `date` usa `dateLimit` como fin planeado. El responsable se resuelve por correo contra `res.users`. Si no existe en Odoo, el proyecto se crea sin gerente asignado, pero el correo queda registrado en la descripcion como metadata de TickedApp.

## Creacion De Tickets

Endpoint de TickedApp:

```text
POST /api/v1/tickeds
```

Flujo:

```text
TickedsService.create()
  -> crea ticket local con Prisma
  -> busca un equipo helpdesk en Odoo
  -> envia helpdesk.ticket/create a Odoo
  -> guarda odooTicketId localmente
  -> usa project.odooProjectId para vincular la tarea
  -> si el proyecto aun no tiene odooProjectId, lo crea en Odoo y guarda el ID
  -> envia project.task/create a Odoo con project_id
  -> guarda odooTaskId localmente
```

Payload enviado a Odoo Soporte:

```json
{
  "vals_list": [
    {
      "name": "Titulo del ticket",
      "description": "Descripcion del ticket",
      "team_id": 1,
      "priority": "2",
      "user_id": 9
    }
  ]
}
```

Payload enviado a Odoo Proyectos como tarea interna:

```json
{
  "vals_list": [
    {
      "name": "Titulo del ticket",
      "description": "Descripcion del ticket\n\nOrigen: TickedApp\nTicket local: TK-001\nProyecto local: Nombre del proyecto",
      "project_id": 12,
      "priority": "2",
      "date_deadline": "2026-06-12 18:00:00",
      "user_ids": [[6, 0, [9]]]
    }
  ]
}
```

Esta doble sincronizacion permite demostrar dos flujos complementarios:

- `helpdesk.ticket`: recepcion y seguimiento de la solicitud del cliente.
- `project.task`: trabajo interno asociado al proyecto en Odoo.

Los correos de usuarios de TickedApp se envian de dos formas:

- Como metadata visible en la descripcion.
- Como campos nativos de email (`email_from` o `partner_email`) cuando el modelo de Odoo los expone.

Los campos de asignacion interna de Odoo (`user_id` y `user_ids`) requieren IDs de `res.users`, por eso se resuelven por correo antes de enviarlos.

## Manejo De Errores

La sincronizacion con Odoo es no bloqueante.

Si Odoo responde correctamente:

```text
Project synced with Odoo #123
Ticket #TCK-0001 synced with Odoo #456
Ticket #TCK-0001 synced as Odoo project task #789
```

Si Odoo falla:

```text
Project created locally but Odoo sync failed: ...
Ticket #TCK-0001 created locally but Odoo sync failed: ...
```

El registro local se conserva. Esto evita que una falla externa en Odoo bloquee el uso del portal.

## Alcance De La Demo

Implementado:

- Crear proyectos en Odoo desde TickedApp.
- Crear tickets Helpdesk en Odoo desde TickedApp.
- Crear tareas de proyecto en Odoo desde tickets de TickedApp.
- Guardar `odooProjectId`, `odooTicketId` y `odooTaskId` en la base local.
- Usar la API moderna JSON-2 de Odoo 19.
- Mantener el portal funcional aunque Odoo no responda.

No implementado todavia:

- Sincronizacion bidireccional.
- Reintentos automaticos.
- Webhooks desde Odoo hacia TickedApp.
- Sincronizacion de facturas o clientes.

## Siguiente Fase Recomendada

Para una version productiva, el siguiente paso seria registrar errores de sincronizacion en una tabla propia y procesar reintentos con jobs en segundo plano.

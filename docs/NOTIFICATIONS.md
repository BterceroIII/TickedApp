# Sistema de notificaciones

## Objetivo

El sistema de notificaciones informa al usuario cuando se le asigna un proyecto o un ticket. Está pensado para el prototipo como una solución simple, persistente y fácil de demostrar con dos sesiones abiertas.

## Flujo actual

1. Un usuario `ADMIN` crea o actualiza un proyecto con un responsable.
2. El backend crea una notificación para el responsable del proyecto.
3. Un usuario `ADMIN` crea o actualiza un ticket con `assignedToId`.
4. El backend crea una notificación para el usuario o admin asignado al ticket.
5. El frontend abre una conexión SSE con `GET /notifications/stream`.
6. Cuando el backend crea la notificación, también emite un evento al stream del usuario.
7. El frontend recibe el evento, actualiza la campana, muestra un toast e invalida las queries relacionadas.
8. El usuario puede marcar una notificación como leída o marcar todas como leídas.

## Endpoints backend

```txt
GET /notifications
GET /notifications/stream
PATCH /notifications/:id/read
PATCH /notifications/read-all
DELETE /notifications/:id
DELETE /notifications
```

Todos los endpoints requieren autenticación. Cada usuario solo puede leer, recibir, modificar y eliminar sus propias notificaciones.

## Integración frontend

Archivos principales:

```txt
apps/frontend/src/services/notifications/notifications.service.ts
apps/frontend/src/components/notifications-bell.tsx
```

El componente `NotificationsBell` usa `Popover` de shadcn/ui y se muestra en:

```txt
apps/frontend/src/App.tsx
apps/frontend/src/components/projects-page.tsx
apps/frontend/src/components/tickeds-page.tsx
```

## Estrategia técnica

Para el prototipo se usa Server-Sent Events:

```txt
Frontend abre EventSource /notifications/stream
Backend crea Notification en base de datos
Backend emite evento SSE tipo notification
Frontend actualiza cache de React Query
Frontend invalida projects/tickets según el payload
```

SSE es suficiente para este caso porque las notificaciones son unidireccionales: backend a navegador. Se mantiene `GET /notifications` como fuente de verdad inicial y para recargas de pantalla. Cuando llega un evento, el frontend invalida `notifications`, `projects`, `projects/progress` y `tickeds` según corresponda para que las tablas se actualicen sin recargar.

No se usa webhook para este flujo porque un webhook es comunicación servidor a servidor. El navegador no expone una URL pública estable para recibir llamadas del backend.

## Prueba recomendada

1. Abrir una sesión como `ADMIN`.
2. Abrir otra sesión como `USER` en otra ventana o navegador.
3. Desde `ADMIN`, crear un proyecto asignado al `USER`.
4. En la sesión del `USER`, verificar que la campana se actualiza en tiempo real.
5. Verificar que el panel contiene la notificación.
6. Repetir el flujo creando un ticket con `assignedToId` del `USER`.
7. Eliminar una notificación individual o limpiar todas desde el panel.

## Mejora futura

Si el producto escala, se puede mover el transporte SSE a un servicio administrado como Pusher o Ably, manteniendo la tabla `notifications` como fuente de verdad:

```txt
Backend crea notificación
Backend emite evento al canal del usuario
Frontend recibe evento
Frontend invalida la query de notificaciones
```

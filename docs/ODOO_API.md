# Odoo External JSON-2 API

Odoo 19 expone una API externa moderna llamada JSON-2. A diferencia de una API REST tradicional, no publica un endpoint distinto por recurso de negocio. En su lugar, permite llamar métodos del ORM de Odoo sobre modelos internos.

## Modelo y Metodo

La estructura general es:

```text
POST /json/2/{model}/{method}
```

Ejemplos:

```text
POST /json/2/project.project/create
POST /json/2/helpdesk.ticket/create
POST /json/2/helpdesk.team/search_read
```

Los modelos representan entidades internas de Odoo:

```text
project.project   -> Proyectos
helpdesk.ticket   -> Tickets de soporte
helpdesk.team     -> Equipos de soporte
project.task      -> Tareas internas de proyectos
res.partner       -> Contactos/clientes
account.move      -> Facturas y documentos contables
```

Los metodos representan operaciones del ORM:

```text
create       -> crea un registro
search_read  -> busca y devuelve registros
write        -> actualiza registros
unlink       -> elimina registros
```

## Autenticacion

La API usa una API key de Odoo enviada como bearer token.

Headers requeridos:

```http
Authorization: bearer ODOO_API_KEY
X-Odoo-Database: ODOO_DATABASE
Content-Type: application/json
```

## Crear Un Proyecto

Para crear un proyecto en Odoo se llama el metodo `create` del modelo `project.project`.

```http
POST https://tu-instancia.odoo.com/json/2/project.project/create
Authorization: bearer ODOO_API_KEY
X-Odoo-Database: ODOO_DATABASE
Content-Type: application/json
```

Body:

```json
{
  "vals_list": [
    {
      "name": "Proyecto creado desde TickedApp",
      "description": "Descripcion del proyecto",
      "date_start": "2026-06-13",
      "date": "2026-06-30",
      "user_id": 9
    }
  ]
}
```

En Odoo, el campo visual "Fecha planeada" de proyecto usa un rango. TickedApp envia `date_start` como fecha de inicio y `date` como fecha final. En el prototipo, `date_start` se toma de `createdAt` y `date` de `dateLimit`.

`user_id` es el gerente/responsable del proyecto en Odoo. TickedApp no envia el nombre del usuario; primero busca `res.users` por correo (`login` o `email`) y solo envia `user_id` si encuentra coincidencia.

Respuesta esperada:

```json
123
```

El numero devuelto es el ID del registro creado en Odoo.

## Crear Un Ticket

Para crear un ticket se usa el modelo `helpdesk.ticket`.

```http
POST https://tu-instancia.odoo.com/json/2/helpdesk.ticket/create
Authorization: bearer ODOO_API_KEY
X-Odoo-Database: ODOO_DATABASE
Content-Type: application/json
```

Body:

```json
{
  "vals_list": [
    {
      "name": "Ticket creado desde TickedApp",
      "description": "Detalle del problema reportado por el cliente",
      "team_id": 1,
      "user_id": 9
    }
  ]
}
```

El campo `team_id` depende de la configuracion de Helpdesk en Odoo. Por eso la integracion primero consulta equipos disponibles con `helpdesk.team/search_read` y usa el primer equipo encontrado.

`user_id` se resuelve por correo del usuario asignado en TickedApp. Si ese usuario no existe en Odoo, el ticket se crea sin responsable asignado.

## Crear Una Tarea De Proyecto

Para reflejar un ticket como trabajo operativo dentro de un proyecto se usa el modelo `project.task`.

```http
POST https://tu-instancia.odoo.com/json/2/project.task/create
Authorization: bearer ODOO_API_KEY
X-Odoo-Database: ODOO_DATABASE
Content-Type: application/json
```

Body:

```json
{
  "vals_list": [
    {
      "name": "Tarea creada desde TickedApp",
      "description": "Detalle operativo del trabajo",
      "project_id": 12,
      "priority": "2",
      "date_deadline": "2026-06-12 18:00:00",
      "user_ids": [[6, 0, [9]]]
    }
  ]
}
```

Para obtener `project_id`, TickedApp usa el `odooProjectId` guardado en su base local al momento de sincronizar el proyecto. Esto evita depender de busquedas por nombre y hace el vinculo mas confiable.

`user_ids` asigna la tarea al usuario de Odoo encontrado por correo. Es un campo many2many, por eso usa el comando ORM `[6, 0, [id]]`.

`date_deadline` usa la fecha estimada del ticket en TickedApp y alimenta el campo "Fecha limite" de la tarea en Odoo.

## Buscar Registros

`search_read` permite buscar registros y devolver campos especificos.

```http
POST https://tu-instancia.odoo.com/json/2/helpdesk.team/search_read
Authorization: bearer ODOO_API_KEY
X-Odoo-Database: ODOO_DATABASE
Content-Type: application/json
```

Body:

```json
{
  "domain": [],
  "fields": ["id", "name"],
  "limit": 1
}
```

## Consideraciones

- Los nombres de modelos y campos dependen de los modulos instalados en Odoo.
- Si el modulo Proyectos no esta instalado, `project.project` no estara disponible.
- Si el modulo Soporte al cliente no esta instalado, `helpdesk.ticket` no estara disponible.
- Algunos campos pueden ser obligatorios segun la configuracion de la instancia.
- Para esta demo se usan campos minimos para reducir el riesgo de errores de configuracion.

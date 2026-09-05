# Backend de administracion

API REST en Node.js conectada a Supabase. Las contraseñas se cifran con bcrypt y nunca se devuelven en las respuestas.

Proyecto Supabase: `https://cwazojjanqvktdnjelpw.supabase.co`

## 1. Crear las tablas

En el dashboard de Supabase abre **SQL Editor**, pega el contenido de `sql/schema.sql` y ejecuta la consulta.

Eso crea:

- `roles` — admin, supervisor, operador
- `users` — usuarios del panel, con `password_hash`
- `audit_logs` — bitacora de acciones

## 2. Configurar variables de entorno

Copia `.env.example` a `.env`:

```bash
copy .env.example .env
```

Completa:

| Variable | Donde obtenerla |
| --- | --- |
| `SUPABASE_URL` | Project Settings > API > Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings > API > `service_role` (secret) |
| `JWT_SECRET` | Una cadena larga y aleatoria, solo para este backend |

Usa la clave `service_role` porque el backend opera como servidor. No la pongas en un frontend.

## 3. Instalar y arrancar

```bash
npm install
npm run dev
```

Health check: `GET http://localhost:3000/health`

## 4. Primer usuario (bootstrap)

Si no hay usuarios, puedes registrar el primer admin **sin token**.

1. Consulta los roles iniciales (solo funciona si aun no hay usuarios):

```http
GET /api/auth/bootstrap
```

2. Crea el primer usuario con el `id` del rol `admin`:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "password": "Admin1234",
  "full_name": "Administrador",
  "role_id": "UUID_DEL_ROL_ADMIN"
}
```

Los registros siguientes solo los puede hacer un admin autenticado.

## Endpoints REST

Base: `/api`

### Auth

| Metodo | Ruta | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/auth/register` | Primer usuario o admin | Crear usuario |
| POST | `/auth/login` | No | Iniciar sesion |
| GET | `/auth/me` | Bearer | Perfil actual |

### Usuarios

| Metodo | Ruta | Roles |
| --- | --- | --- |
| GET | `/users` | admin, supervisor |
| GET | `/users/:id` | admin, supervisor |
| POST | `/users` | admin |
| PUT | `/users/:id` | admin |
| PATCH | `/users/:id/password` | admin |
| DELETE | `/users/:id` | admin |

### Roles

| Metodo | Ruta | Roles |
| --- | --- | --- |
| GET | `/roles` | admin, supervisor |
| POST | `/roles` | admin |
| PUT | `/roles/:id` | admin |
| DELETE | `/roles/:id` | admin |

### Auditoria

| Metodo | Ruta | Roles |
| --- | --- | --- |
| GET | `/audit-logs` | admin |

## Ejemplo de login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@empresa.com",
  "password": "Admin1234"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "...",
      "email": "admin@empresa.com",
      "full_name": "Administrador",
      "role_id": "...",
      "roles": { "name": "admin" }
    }
  }
}
```

Peticiones protegidas:

```http
Authorization: Bearer eyJhbGciOi...
```

## Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds por defecto)
- `password_hash` no se serializa en JSON
- JWT con expiracion (8h por defecto)
- Roles: admin (CRUD), supervisor (lectura), operador (sin acceso a estas rutas)
- Helmet, CORS y validacion basica de campos

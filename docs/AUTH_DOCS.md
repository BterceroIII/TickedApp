# Authentication & Roles System

## Base URL

```
http://localhost:3000/auth
```

---

## Endpoints

### 1. Create Account

Registers a new user. Sets `confirmed: false` and generates a 6-digit verification token.

```
POST /auth/create-account
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "myPassword123"
}
```

**Response (201):**
```json
{
  "message": "Cuenta creada, revisa tu email para confirmarla"
}
```

**Errors:**
- `409` — Email already exists

---

### 2. Confirm Account

Confirms the account using the 6-digit token sent by email.

```
POST /auth/confirm-account
```

**Body:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "message": "Cuenta confirmada exitosamente"
}
```

**Errors:**
- `401` — Invalid token

---

### 3. Login

Authenticates and creates an HTTP-only cookie session.

```
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "myPassword123"
}
```

**Response (200):**

Headers:

```http
Set-Cookie: tickedapp.session=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000
```

In production the cookie name uses the `__Host-` prefix and the `Secure` flag:

```http
Set-Cookie: __Host-tickedapp.session=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000
```

```json
{
  "message": "Sesión iniciada correctamente"
}
```

**Errors:**
- `404` — User not found
- `403` — Account not confirmed
- `401` — Invalid password

---

### 3.1 Logout

Clears the current HTTP-only cookie session.

```
POST /auth/logout
```

**Response (200):**

```json
{
  "message": "Sesión cerrada correctamente"
}
```

---

### 4. Forgot Password

Generates a 6-digit token for password reset.

```
POST /auth/forgot-password
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Revisa tu email para las instrucciones"
}
```

**Errors:**
- `404` — User not found

---

### 5. Validate Token

Checks if a password reset token is valid.

```
POST /auth/validate-token
```

**Body:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "message": "Token válido"
}
```

**Errors:**
- `404` — Invalid token

---

### 6. Reset Password

Resets the password using a valid token.

```
POST /auth/reset-password/:token
```

**Body:**
```json
{
  "password": "newPassword123"
}
```

**Response (200):**
```json
{
  "message": "Password cambiado exitosamente"
}
```

**Errors:**
- `404` — Invalid token

---

### 7. Get Current User

Returns info of the authenticated user.

```
GET /auth/user
```

**Authentication:**

The browser sends the `HttpOnly` session cookie automatically when the frontend request uses credentials.

```typescript
axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
})
```

Bearer tokens are still accepted by the backend for API clients and Swagger testing:

```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER"
}
```

**Errors:**
- `401` — Unauthorized

---

### 8. Get All Users

Returns all users (for project responsible selection).

```
GET /auth/users
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

---

## JWT Token

The JWT is stored in an HTTP-only cookie managed by NestJS. The frontend must not store it in `localStorage` or `sessionStorage`.

Cookie settings:

| Flag | Value |
|------|-------|
| `HttpOnly` | Enabled |
| `Secure` | Enabled in production |
| `SameSite` | `Lax` |
| `Path` | `/` |
| `Max-Age` | 30 days |
| Production name | `__Host-tickedapp.session` |
| Development name | `tickedapp.session` |

| Claim | Description |
|-------|-------------|
| `id` | User UUID |
| `iat` | Issued at |
| `exp` | Expiration (30 days) |

Decoded token example:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1747152000,
  "exp": 1749744000
}
```

---

## Auth Flow Diagram

```
                  ┌──────────────┐
                  │  Register    │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  Confirm     │
                  │  Account     │
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                   │  Login       │
                   │  → Cookie    │
                  └──────┬───────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
      ┌──────────────┐     ┌──────────────┐
      │  Access       │     │  Forgot      │
      │  Protected    │     │  Password    │
      │  Endpoints    │     └──────┬───────┘
      └──────────────┘            │
                                  ▼
                          ┌──────────────┐
                          │  Reset        │
                          │  Password     │
                          └──────────────┘
```

---

## Roles & Permissions

Two roles: `ADMIN` and `USER`.

### Role guard

Protected endpoints use `@Roles()` decorator + `RolesGuard`. Unauthenticated requests return `401`, unauthorized return `403`.

### Project access rules

| Role | Can create projects | Can edit/delete projects | Can see all projects | Can only see own projects |
|------|:---:|:---:|:---:|:---:|
| ADMIN | ✅ | ✅ | ✅ | — |
| USER | ❌ | ❌ | ❌ | ✅ |

`GET /projects` and `GET /projects/progress` apply the same visibility rule: `ADMIN` receives all projects, while `USER` only receives projects assigned to their user ID.

### How to use guards

```typescript
// Any authenticated user
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()

// Only ADMIN
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
```

### Frontend role check

The role is **not** included in the JWT payload. To check the current user's role, query the user's data with credentials enabled. The `GET /auth/user` response includes `role`:

```
GET /auth/user
Cookie: tickedapp.session=<http-only-cookie>
```

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN"
}
```

Frontend checks are only for UX. The backend remains the source of truth with `JwtAuthGuard`, `RolesGuard`, and `@Roles(UserRole.ADMIN)` on administrative project mutations.

### Frontend project permissions

The projects page derives `canManageProjects` from `useCurrentUser()`:

```typescript
const canManageProjects = currentUserQuery.data?.role === "ADMIN"
```

UI behavior:

| Role | Create button | Row actions | Edit form | Delete action | Project detail/list |
|------|:---:|:---:|:---:|:---:|:---:|
| ADMIN | Visible | Visible | Enabled | Enabled | Visible |
| USER | Hidden | Hidden | Not rendered | Not rendered | Read-only |

Security rule: hiding buttons does not authorize the request. `POST /projects`, `PATCH /projects/:id`, and `DELETE /projects/:id` must stay protected with `@Roles(UserRole.ADMIN)`.

---

## Frontend Route Protection

This project uses Vite + TanStack Router, not TanStack Start. Because the app runs in the browser, it cannot read `HttpOnly` cookies directly.

Protected routes must call `GET /auth/user` in `beforeLoad` for UX-level redirects. The backend remains the source of truth and must enforce auth with `JwtAuthGuard` on protected endpoints.

Pattern:

```typescript
beforeLoad: async ({ context }) => {
  try {
    await context.queryClient.ensureQueryData({
      queryKey: ["auth", "user"],
      queryFn: fetchCurrentUser,
    })
  } catch {
    throw redirect({ to: "/login" })
  }
}
```

Security rule: route guards are for navigation UX only; backend guards are required for data protection.

---

## CORS Requirements

Cookie auth requires credentials-enabled CORS. The backend uses:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  credentials: true,
})
```

Set `FRONTEND_URL` to the exact frontend origin in each environment.

---

## Seed Data

| Email | Password | Role |
|-------|----------|------|
| admin@tickedapp.com | password | ADMIN |
| juan@tickedapp.com | password | USER |
| maria@tickedapp.com | password | USER |

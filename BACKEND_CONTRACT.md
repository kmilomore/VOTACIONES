# Contrato de integración backend ↔ frontend

Documento para el equipo de backend. Describe los endpoints que el frontend espera, el flujo de autenticación, los requisitos de seguridad y los ítems que el equipo frontend debe eliminar antes de pasar a producción.

---

## Flujo de autenticación

```
[1] POST /api/auth/verify-credentials  → valida RUT + email, inicia sesión, dispara envío de OTP
[2] POST /api/auth/verify-otp          → valida OTP, devuelve token de votación
[3] GET  /api/candidates               → lista de candidatos (requiere token)
[4] POST /api/votes                    → emite el voto (requiere token)
```

---

## Endpoints esperados

### 1. `POST /api/auth/verify-credentials`

**Cuerpo de la solicitud:**
```json
{
  "rut": "12345678-9",
  "email": "usuario@slep.cl"
}
```

**Respuesta exitosa `200`:**
```json
{
  "user": {
    "fullName": "Nombre completo del votante",
    "organization": "SLEP Santiago Centro"
  }
}
```

**Respuesta de error `401`:**
```json
{ "message": "No encontramos una coincidencia valida para el RUT y correo ingresados." }
```

> **Nota de seguridad:** el mensaje de error **nunca debe indicar qué campo falló** (RUT vs correo). Deben fallar juntos para evitar ataques de enumeración de usuarios.

---

### 2. `POST /api/auth/verify-otp`

> El frontend **no envía** el OTP junto con credenciales — es un paso separado. El backend debe asociar el OTP a la sesión iniciada en el paso anterior.

**Cuerpo de la solicitud:**
```json
{ "otp": "123456" }
```

**Respuesta exitosa `200`:**
```json
{ "voteToken": "<JWT u opaque token de un solo uso>" }
```

**Respuesta de error `401`:**
```json
{ "message": "El codigo OTP no es valido o ha expirado." }
```

> **Nota de seguridad:** el OTP **debe tener expiración server-side** (recomendado: 5 minutos). El frontend tiene un temporizador de 120 segundos en la papeleta, pero **no limita la validez del OTP**. El servidor es la única fuente de verdad.

---

### 3. `GET /api/candidates`

**Cabeceras requeridas:**
```
Authorization: Bearer <voteToken>
```

**Respuesta exitosa `200`:**
```json
[
  {
    "id": "marisol-huerta",
    "name": "Marisol Huerta",
    "role": "Representante de estamento docente",
    "slogan": "...",
    "initials": "MH",
    "accentColor": "#8c4f2f"
  }
]
```

---

### 4. `POST /api/votes`

**Cabeceras requeridas:**
```
Authorization: Bearer <voteToken>
```

**Cuerpo de la solicitud:**
```json
{ "candidateId": "marisol-huerta" }
```

**Respuesta exitosa `200`:**
```json
{
  "receiptCode": "SLEP-MH-<identificador único>",
  "candidate": { "id": "...", "name": "..." }
}
```

**Respuesta de error `409` (voto duplicado):**
```json
{ "message": "Ya has emitido tu voto en esta eleccion." }
```

> **Nota de seguridad:** la prevención de doble voto **debe ser server-side**. El frontend no tiene mecanismo para detectarlo.

---

## Gestión de sesión / token

El frontend actualmente no gestiona tokens (fase mock). Al integrar el backend, elegir **una** de las siguientes estrategias y coordinar con el frontend:

| Estrategia | Ventaja | Consideración |
|---|---|---|
| **Cookie httpOnly** (recomendado) | El token nunca es accesible por JS; protección XSS automática | Requiere `SameSite=Strict` o `Lax` + CSRF token para mutaciones |
| **JWT en memoria React** | Simple de implementar en el frontend | Desaparece al refrescar la página; no persiste |

> Si se usa cookie httpOnly, el endpoint `POST /api/votes` debe incluir protección CSRF (cabecera custom o token doble-submit).

---

## Requisitos de seguridad para el backend

| Área | Requisito |
|---|---|
| **Rate limiting** | Mínimo: 5 intentos fallidos de login por RUT en 15 min. 3 intentos fallidos de OTP por sesión. 1 voto por usuario registrado. |
| **OTP** | Expiración: máximo 10 minutos. Un solo uso (invalidar tras verificación exitosa). Generación criptográficamente segura (`crypto.randomInt` o equivalente). |
| **Voto único** | Verificar en BD que el `userId` no ha votado antes de registrar. La verificación debe ser atómica (transacción). |
| **Logging de auditoría** | Registrar IP, timestamp y `userId` de cada evento: login intentado, OTP enviado, voto emitido. Sin registrar el valor del voto (secreto). |
| **HTTPS** | Obligatorio en producción. Agregar `Strict-Transport-Security` en el servidor de producción. |
| **CORS** | Configurar el origen exacto del frontend. No usar `*`. |
| **Códigos de comprobante** | Generar `receiptCode` con UUID v4 o similar — no timestamp como en el mock. |

---

## Items que el equipo frontend eliminará antes de producción

Los archivos marcados con `// TODO(backend-integration):` en el código indican qué debe cambiarse. Resumen:

| Archivo | Cambio pendiente |
|---|---|
| `src/app/page.tsx` | Eliminar `handleRestart` con credenciales pre-cargadas; reemplazar con campos vacíos |
| `src/app/page.tsx` | Actualizar texto de `stage-card__description` a copy real (sin mención de "datos simulados") |
| `src/components/views/LoginView.tsx` | Eliminar chip de hint con RUT y correo de prueba |
| `src/components/views/OtpView.tsx` | Eliminar chip de hint con OTP de prueba |
| `src/lib/mock-api.ts` | **Eliminar** todo el archivo. Reemplazar las importaciones en `page.tsx` con llamadas `fetch` reales |
| `src/types/index.ts` | Mantener interfaces; ajustar si el backend devuelve campos adicionales o distintos |
| `next.config.mjs` | En CSP: reemplazar `'unsafe-inline'` / `'unsafe-eval'` en `script-src` con nonce via middleware de Next.js |

---

## Sustitución del mock en `page.tsx`

Al conectar el backend, reemplazar cada importación de `mock-api.ts` por un `fetch`:

```typescript
// ANTES (mock)
import { verifyUserCredentials } from '@/lib/mock-api';
const user = await verifyUserCredentials(rut, email);

// DESPUÉS (backend real)
const response = await fetch('/api/auth/verify-credentials', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ rut, email }),
});
if (!response.ok) {
  const { message } = await response.json();
  throw new Error(message);
}
const { user } = await response.json();
```

El patrón es idéntico para `verifyOtpCode`, `getCandidates` y `submitVote` — solo cambia el endpoint y el cuerpo de la solicitud.

---

## Interfaces TypeScript vigentes

```typescript
// src/types/index.ts — compartir con backend para alinear contratos

interface User {
  rut: string;          // solo se usa para autenticación, no se devuelve post-login
  email: string;        // solo para autenticación
  otp: string;          // solo para autenticación
  fullName: string;     // se muestra en la papeleta
  organization: string; // se muestra en la vista de éxito
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  slogan: string;
  initials: string;     // 2 caracteres, para el badge visual
  accentColor: string;  // hex, para el acento visual de la tarjeta
}

type AppState = 'login' | 'otp' | 'vote' | 'success';
```

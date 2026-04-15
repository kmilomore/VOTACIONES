# Contrato de integracion backend ↔ frontend

Documento para el equipo de backend. Describe los endpoints que el frontend espera, el flujo de autenticacion, los requisitos de seguridad y los items que el equipo frontend debe eliminar antes de pasar a produccion.

Este frontend se distribuye como esqueleto reutilizable para distintos Servicios Locales. El backend no forma parte de este repositorio: cada Servicio Local es responsable de implementar, desplegar y operar su propia capa de autenticacion, OTP, padron, emision de voto, persistencia y auditoria.

La expectativa de este documento es simple: cualquier equipo local puede conservar la experiencia de usuario del frontend siempre que su backend cumpla este contrato o entregue un adaptador equivalente.

---

## Flujo de autenticación

```
[1] POST /api/auth/verify-credentials  → valida RUT + email, inicia sesión, dispara envío de OTP
[2] POST /api/auth/verify-otp          → valida OTP sobre la sesión iniciada
[3] GET  /api/candidates               → lista de candidatos (requiere sesión válida)
[4] POST /api/votes                    → emite el voto (requiere sesión válida)
[5] DELETE /api/session                → destruye la sesión local del flujo
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
    "organization": "SLEP COLCHAGUA
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

> El frontend **no envia** el OTP junto con credenciales. Es un paso separado y el backend debe asociarlo a la sesion iniciada en el paso anterior.

**Cuerpo de la solicitud:**
```json
{ "otp": "123456" }
```

**Respuesta exitosa `200`:**
```json
{ "ok": true }
```

**Respuesta de error `401`:**
```json
{ "message": "El codigo OTP no es valido o ha expirado." }
```

> **Nota de seguridad:** el OTP **debe tener expiración server-side** (recomendado: 5 minutos). El frontend tiene un temporizador de 120 segundos en la papeleta, pero **no limita la validez del OTP**. El servidor es la única fuente de verdad.

---

### 3. `GET /api/candidates`

**Mecanismo requerido:**

Sesion valida ya asociada al votante autenticado. En este esqueleto, la referencia es una cookie httpOnly. Si un Servicio Local usa otro mecanismo, debe mantener el mismo comportamiento funcional para el frontend.

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

**Mecanismo requerido:**

Sesion valida ya asociada al votante autenticado.

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

### 5. `DELETE /api/session`

**Objetivo:**

- Cerrar el flujo al volver al login.
- Limpiar la sesion cuando el usuario reinicia la demo.
- Invalidar la sesion por inactividad o salida manual.

**Respuesta exitosa `204`:**

Sin cuerpo.

---

## Gestion de sesion / token

El frontend actualmente opera mejor con una sesion servidor administrada por el BFF de Next.js. Al integrar el backend, cada Servicio Local puede elegir una estrategia interna, pero hacia el frontend debe conservar una experiencia equivalente:

| Estrategia | Ventaja | Consideración |
|---|---|---|
| **Cookie httpOnly** (recomendado) | El token nunca es accesible por JS; proteccion XSS automatica | Requiere `SameSite=Strict` o `Lax` + CSRF token para mutaciones |
| **Sesion opaca en BFF** | El cliente nunca ve el token del backend real | Requiere mantener un adaptador servidor en Next.js |
| **JWT en memoria React** | Posible, pero menos robusto para este esqueleto | Expone mas logica al cliente y complica el refresco de pagina |

> Si se usa cookie httpOnly, el endpoint `POST /api/votes` debe incluir proteccion CSRF (cabecera custom o token doble-submit).

---

## Responsabilidad por Servicio Local

- Este repositorio entrega la arquitectura del frontend y el contrato de integracion.
- Cada Servicio Local define su modelo de datos, proveedor de correo o mensajeria OTP, trazabilidad, despliegue y cumplimiento normativo.
- Las reglas de padron, elegibilidad, cierre de mesa, auditoria y resguardo de evidencia deben implementarse del lado servidor.
- Si un Servicio Local necesita variaciones de infraestructura, debe mantener compatibilidad funcional con este contrato para no romper el frontend compartido.

---

## Requisitos de seguridad para el backend

Los controles marcados con ✅ ya están implementados en este repositorio. Los marcados con ⏳ son responsabilidad del backend del Servicio Local.

| Área | Requisito | Estado |
|---|---|---|
| **Rate limiting** | 20 req/min por IP en todas las rutas API (middleware Edge). Límite de 5 intentos de login en la UI. Límite de 3 intentos OTP validado en servidor. | ✅ Frontend |
| **OTP server-side** | Contador `otpAttempts` en `SessionRecord`; sesión destruida automáticamente al 3er fallo. | ✅ Frontend |
| **OTP dinámico** | Generación y envío real por correo o SMS con expiración. El mock usa `otp` estático solo para demo. | ⏳ Backend SLEP |
| **Validación formato** | OTP: `^\d{6}$` en servidor antes de consumir intentos. RUT: `^\d{7,8}-[\dkK]$` antes de consultar padrón. Email: máx 254 chars. | ✅ Frontend |
| **Voto único** | `hasUserVoted()` + `markUserAsVoted()` sin `await` entre ellos (atómico en Node.js single-thread). En producción multi-instancia: transacción BD. | ✅ Frontend / ⏳ BD producción |
| **Sesión post-voto** | `destroySession()` + `maxAge: 0` emitidos inmediatamente tras `submitVote` exitoso. | ✅ Frontend |
| **Logging de auditoría** | Registrar IP, timestamp y `userId` de cada evento sin registrar el valor del voto. | ⏳ Backend SLEP |
| **Sesión httpOnly** | Cookie `voting_session` con `HttpOnly`, `SameSite=Lax`, `Secure` (producción), `maxAge=600s`. | ✅ Frontend |
| **HTTPS** | `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` activo. | ✅ Frontend |
| **CORS** | Configurar origen exacto del frontend en el backend. No usar `*`. | ⏳ Backend SLEP |
| **CSRF** | Sin token CSRF implícito en el mock de demo. Con cookie httpOnly en producción: cabecera `X-Requested-With` o doble-submit. | ⏳ Backend SLEP |
| **CSP** | Nonce-based por request en middleware Edge. En producción sin `unsafe-inline` ni `unsafe-eval`. | ✅ Frontend |

---

## Items pendientes del equipo frontend antes de producción

| Archivo | Cambio | Estado |
|---|---|---|
| `src/app/page.tsx` | Cliente consume `src/lib/api-client.ts` sin importar `mock-api.ts` | ✅ Hecho |
| `src/app/page.tsx` | Expiración por inactividad en estados `otp` y `vote` | ✅ Hecho |
| `src/app/api/**` | Validación formato RUT y OTP en servidor antes de consultar padrón | ✅ Hecho |
| `src/lib/server-session.ts` | Contador OTP server-side con destrucción automática de sesión | ✅ Hecho |
| `src/app/api/votes/route.ts` | Voto atómico (check + mark sin await intermedio) | ✅ Hecho |
| `src/app/api/votes/route.ts` | Sesión destruida inmediatamente tras voto exitoso | ✅ Hecho |
| `src/lib/server-session.ts` | Store persistido en `globalThis` para sobrevivir Hot Reload | ✅ Hecho |
| `src/types/index.ts` | Modelo público `User` sin `rut`, `email`, `otp` | ✅ Hecho |
| `next.config.mjs` | CSP nonce-based en middleware, HSTS, CORP | ✅ Hecho |
| `src/app/page.tsx` | Eliminar texto de credenciales visibles en UI (antes de demo pública) | ⏳ Pendiente |
| `src/lib/mock-api.ts` | Reemplazar mock por adaptador conectado al backend real del SLEP | ⏳ Pendiente (cada SLEP) |
| `src/lib/server-session.ts` | Sustituir store en memoria por Redis, KV o BD | ⏳ Pendiente (cada SLEP) |
| CSRF | Agregar protección CSRF en `POST /api/votes` y `POST /api/auth/*` | ⏳ Pendiente con backend real |

---

## Sustitucion del mock en la capa servidor

Al conectar el backend real, reemplazar el uso de `mock-api.ts` dentro de `src/app/api/**` o dentro de un adaptador servidor. El cliente no deberia cambiar.

```typescript
// ANTES (mock del lado servidor)
import { verifyUserCredentials } from '@/lib/mock-api';
const user = await verifyUserCredentials(rut, email);

// DESPUES (adaptador servidor conectado al backend real)
const response = await fetch('https://backend-local.example/api/auth/verify-credentials', {
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

El patron es identico para `verifyOtpCode`, `getCandidates` y `submitVote`. La UI puede seguir consumiendo las mismas rutas internas de Next.js.

---

## Interfaces TypeScript vigentes

```typescript
// src/types/index.ts — compartir con backend para alinear contratos

interface User {
  fullName: string;     // se muestra en la papeleta
  organization: string; // se muestra en la vista de éxito
  estamento: Estamento; // define el padron visible en la UI
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  slogan: string;
  initials: string;     // 2 caracteres, para el badge visual
  accentColor: string;  // hex, para el acento visual de la tarjeta
  estamento: Estamento;
}

type AppState = 'login' | 'otp' | 'vote' | 'success';
```

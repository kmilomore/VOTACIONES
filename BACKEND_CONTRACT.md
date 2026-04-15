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

| Área | Requisito |
|---|---|
| **Rate limiting** | Mínimo: 5 intentos fallidos de login por RUT en 15 min. 3 intentos fallidos de OTP por sesión. 1 voto por usuario registrado. El frontend ya aplica estos límites a nivel de UI como primera línea; el backend es la fuente de verdad. |
| **OTP** | Expiración: máximo 10 minutos. Un solo uso (invalidar tras verificación exitosa). Generación criptográficamente segura (`crypto.randomInt` o equivalente). |
| **Voto único** | Verificar en BD que el `userId` no ha votado antes de registrar. La verificación debe ser atómica (transacción). |
| **Logging de auditoría** | Registrar IP, timestamp y `userId` de cada evento: login intentado, OTP enviado, voto emitido. Sin registrar el valor del voto (secreto). |
| **Sesion** | La sesion debe quedar asociada al votante autenticado y no depender de datos enviados por el cliente para inferir el padron. |
| **HTTPS** | Obligatorio en producción. El frontend ya envía `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`. |
| **CORS** | Configurar el origen exacto del frontend. No usar `*`. |
| **Códigos de comprobante** | Generar `receiptCode` con UUID v4 o similar. El mock ya usa `crypto.randomUUID()` como referencia. |
| **CSP** | El frontend implementa CSP nonce-based vía middleware Edge. Si el backend sirve el HTML directamente, debe propagar el nonce vía cabecera `x-nonce`. |

---

## Items pendientes del equipo frontend antes de producción

Los ítems ya completados en Fase 1b están marcados. Los restantes requieren integración con el backend real.

| Archivo | Cambio | Estado |
|---|---|---|
| `src/app/page.tsx` | `handleRestart` limpia campos en blanco (sin pre-relleno) | ✅ Hecho |
| `src/app/page.tsx` | Barra de progreso de 3 pasos reemplaza los step-chips por vista | ✅ Hecho |
| `src/app/page.tsx` | El cliente consume `src/lib/api-client.ts` en lugar de importar `mock-api.ts` | ✅ Hecho |
| `src/app/page.tsx` | Actualizar texto del banner a copy real (sin "datos simulados") | ⏳ Pendiente (Fase 3) |
| `src/components/views/LoginView.tsx` | Chip de hint eliminado | ✅ Hecho |
| `src/components/views/OtpView.tsx` | Chip de hint eliminado | ✅ Hecho |
| `src/components/views/VotingView.tsx` | Mostrar `role` y `slogan` del candidato en cada tarjeta | ✅ Hecho |
| `src/app/api/**` | Mantener el BFF de Next.js como capa estable frente al backend del Servicio Local | ✅ Hecho |
| `src/lib/mock-api.ts` | Reemplazar el mock local por adaptador o backend real | ⏳ Pendiente (Fase 3) |
| `src/lib/server-session.ts` | Sustituir store en memoria por infraestructura real | ⏳ Pendiente (Fase 3) |
| `src/types/index.ts` | Mantener en cliente solo el modelo publico del votante | ✅ Hecho |
| `next.config.mjs` | CSP movida al middleware con nonce | ✅ Hecho |
| `next.config.mjs` | HSTS agregado | ✅ Hecho |

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

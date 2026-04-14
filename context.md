# Contexto técnico — Portal de Votación del Consejo Local

## Descripción general

Portal web institucional para la emisión de votos del **Consejo Local del Servicio Local de Educación Pública (SLEP) Santiago Centro**. La aplicación implementa un flujo guiado de 4 pasos: identificación por RUT, verificación OTP, papeleta digital con temporizador y confirmación de voto.

---

## Fase actual: Frontend con mock data

**Fase 1** de un desarrollo en etapas. El objetivo de esta fase es validar:
- Flujo de usuario completo (UX) de extremo a extremo
- Máquina de estados y transiciones
- Diseño institucional y accesibilidad
- Componentes aislados y reutilizables

El backend real (base de datos, autenticación segura, envío de correo) se implementará en fases posteriores (Fase 3 / 4). Toda la lógica de negocio actual vive en `src/lib/mock-api.ts` y usa `Promesas + setTimeout` para simular latencia de red.

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 15.x | Framework — App Router |
| React | 19.x | UI — Client Components |
| TypeScript | 5.x | Tipado estricto |
| CSS puro | — | Estilos con variables custom |

Sin librerías de UI externas (no Tailwind, no MUI). Todo el sistema de diseño está definido en `src/app/globals.css`.

---

## Arquitectura de archivos

```
src/
├── app/
│   ├── layout.tsx          # Root layout — metadatos, font, globals.css
│   ├── page.tsx            # Orquestador principal (Client Component)
│   └── globals.css         # Variables CSS, paleta institucional, componentes
├── components/
│   └── views/              # Vistas aisladas, una por cada estado del flujo
│       ├── LoginView.tsx   # Paso 1: RUT (número + dígito verificador) + email
│       ├── OtpView.tsx     # Paso 2: código OTP de 6 dígitos
│       ├── VotingView.tsx  # Paso 3: papeleta + temporizador 120s
│       └── SuccessView.tsx # Paso 4: confirmación + código de comprobante
├── lib/
│   └── mock-api.ts         # Simulación de backend — usuarios, candidatos, OTP
└── types/
    └── index.ts            # Interfaces TypeScript: User, Candidate, AppState
```

Archivos raíz relevantes:
```
fondo.webp          # Imagen de fondo institucional (ciudad Santiago)
next.config.mjs     # Configuración de Next.js — headers estáticos (HSTS, X-Frame, etc.)
tsconfig.json       # Configuración TypeScript estricta con alias @/*
```

Middleware:
```
src/middleware.ts   # CSP nonce-based por request; se ejecuta en el Edge Runtime
```

---

## Máquina de estados (`AppState`)

```
'login' → 'otp' → 'vote' → 'success'
           ↑                    ↓
           └────────────────────┘  (reiniciar demo)
```

El estado vive en `src/app/page.tsx` como `useState<AppState>('login')`. Cada transición se produce solo si la llamada a `mock-api` resuelve sin error.

**Límites de intentos:**
- Login: máximo 5 intentos fallidos → formulario bloqueado
- OTP: máximo 3 intentos fallidos → regreso forzado a login

---

## Interfaces TypeScript

```typescript
// src/types/index.ts

interface User {
  rut: string;
  email: string;
  otp: string;
  fullName: string;
  organization: string;
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  slogan: string;
  initials: string;
  accentColor: string;
}

type AppState = 'login' | 'otp' | 'vote' | 'success';
```

---

## Mock API (`src/lib/mock-api.ts`)

### Credenciales de prueba

> Las credenciales ya no se muestran en pantalla ni se exportan en código.
> Para probar el flujo, consultar directamente `VALID_USER` en `src/lib/mock-api.ts` (solo en entorno de desarrollo).

### Funciones exportadas

| Función | Signatura | Descripción |
|---|---|---|
| `verifyUserCredentials` | `(rut, email) → Promise<User>` | Valida RUT + correo contra `VALID_USER`. Lanza error si no coinciden. |
| `verifyOtpCode` | `(otp) → Promise<string>` | Valida el código OTP. Lanza error si es incorrecto. |
| `getCandidates` | `() → Promise<Candidate[]>` | Devuelve el array de candidatos. Simula 500ms de latencia. Solo se llama tras OTP exitoso. |
| `submitVote` | `(candidateId) → Promise<{receiptCode, candidate}>` | Registra el voto. `receiptCode` usa `crypto.randomUUID()`. |

Todas las funciones simulan latencia aleatoria entre 700ms y 1400ms usando `setTimeout`.

---

## Candidatos registrados

| # | Nombre | Iniciales | Color |
|---|---|---|---|
| 1 | Marisol Huerta | MH | `#8c4f2f` |
| 2 | Vianka Mejías | VM | `#355c7d` |
| 3 | Ximena Pino | XP | `#44633f` |
| 4 | Jorge Barahona | JB | `#6f4b8b` |

---

## Sistema de diseño

### Paleta principal

| Variable | Valor | Uso |
|---|---|---|
| `--brand-blue` | `#0b5294` | Botón primario, foco |
| `--brand-blue-mid` | `#0a4278` | Hover del botón, links |
| `--brand-blue-deep` | `#082f5a` | Header institucional |
| `--brand-red` | `#e02a3b` | Acento rojo SLEP |
| `--text-dark` | `#0c2138` | Texto principal en paneles |
| `--muted-dark` | `#4e6a85` | Texto secundario |

### Tipografía

- **UI / Labels / Botones:** `Segoe UI, system-ui, -apple-system, sans-serif`
- **Títulos / Cuerpo:** `Cambria, Georgia, 'Times New Roman', serif`

### Componentes CSS clave

| Clase | Descripción |
|---|---|
| `.shell` | Wrapper raíz con fondo `fondo.webp` |
| `.stage-card` | Contenedor modal central (max 560px) |
| `.stage-card__intro` | Banda azul institucional con título del portal |
| `.panel` | Tarjeta blanca interior para cada vista |
| `.step-chip` | Badge de progreso "Paso N de 3" |
| `.rut-group` | Grid de 3 columnas: número, guion, dígito verificador |
| `.candidate-card` | Tarjeta de candidato seleccionable |
| `.button--primary` | Botón azul institucional ancho completo |

---

## Seguridad implementada (Fase 1b)

### Headers HTTP

Gestionados en dos capas:

| Capa | Archivo | Headers |
|---|---|---|
| Estáticos | `next.config.mjs` | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` |
| Dinámicos | `src/middleware.ts` | `Content-Security-Policy` (nonce por request) |

### Content Security Policy

- En **desarrollo**: `unsafe-inline` + `unsafe-eval` para compatibilidad con Fast Refresh de Next.js.
- En **producción**: `nonce-{nonce} + strict-dynamic`. Nonce generado con `crypto.randomUUID()` por cada request en el middleware Edge.

### Rate limiting frontend

| Flujo | Máximo de intentos | Consecuencia |
|---|---|---|
| Login (RUT + email) | 5 intentos fallidos | Formulario bloqueado (`isLocked=true`) |
| OTP | 3 intentos fallidos | Regreso forzado a login + reseteo de estado |

### Integridad del estado

- `getCandidates()` solo se invoca tras verificación OTP exitosa (no en mount inicial).
- Al retroceder desde OTP, se limpian `otp`, `user` y ambos contadores.
- `handleRestart()` limpia todos los campos — sin pre-relleno de credenciales de prueba.
- `receiptCode` usa `crypto.randomUUID()` — no timestamp predecible.

---

## Temporizador de votación

- Duración: **120 segundos**
- Se inicia al entrar a `VotingView` (estado `vote`)
- Implementado con `useEffect` + `window.setTimeout` (no `setInterval`)
- Al llegar a 0, el botón "Confirmar voto" se deshabilita y aparece mensaje de sesión expirada

---

## Roadmap de fases

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | Frontend con mock data — validación UX y diseño | ✅ Completado |
| Fase 1b | Auditoría de seguridad frontend (CSP nonce, HSTS, rate limiting, receiptCode seguro) | ✅ Completado |
| Fase 2 | Testing (Vitest + RTL unit tests · Playwright E2E) | ✅ Completado |
| Fase 3 | Backend: autenticación real, envío de correo, base de datos | ⬜ Pendiente |
| Fase 4 | Despliegue en producción (Vercel + BD serverless) | ⬜ Pendiente |

---

## Repositorio

[https://github.com/kmilomore/VOTACIONES](https://github.com/kmilomore/VOTACIONES)

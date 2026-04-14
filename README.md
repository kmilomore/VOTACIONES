# Portal de Votación — SLEP Santiago Centro

Portal web institucional para la emisión de votos del Consejo Local del Servicio Local de Educación Pública (SLEP) Santiago Centro. Construido con **Next.js 15**, **React 19** y **TypeScript**.

---

## Inicio rápido

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de producción
```

> **Credenciales de prueba:** viven únicamente en `src/lib/mock-api.ts`. No están en la UI ni en el bundle de producción.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 3000) |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run test` | Tests unitarios — Vitest + React Testing Library |
| `npm run test:e2e` | Tests E2E — Playwright |
| `npm run test:coverage` | Cobertura de tests |

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 15.x | Framework — App Router |
| React | 19.x | UI — Client Components |
| TypeScript | 5.x | Tipado estricto |
| Tailwind CSS | 4.x | Estilos + design tokens |

Sin librerías de UI externas (no MUI, no shadcn). El sistema de diseño institucional está en `src/app/globals.css`.

---

## Estructura del proyecto

```
src/
├── middleware.ts           # Rate limiting por IP + CSP nonce por request (Edge Runtime)
├── app/
│   ├── layout.tsx          # Root layout — fuerza renderizado dinámico para inyección de nonce
│   ├── page.tsx            # Orquestador — máquina de estados (login → otp → vote → success)
│   └── globals.css         # Variables CSS, animaciones, componentes utilitarios
├── components/
│   └── views/
│       ├── LoginView.tsx   # Paso 1: RUT (validador módulo 11 en tiempo real) + email
│       ├── OtpView.tsx     # Paso 2: OTP en 6 cajas separadas con auto-avance y pegado
│       ├── VotingView.tsx  # Paso 3: papeleta + timer + modal de confirmación
│       └── SuccessView.tsx # Paso 4: check animado + código de comprobante
├── lib/
│   └── mock-api.ts         # Simulación de backend con latencia aleatoria
└── types/
    └── index.ts            # Interfaces: User, Candidate, AppState
```

---

## Flujo de la aplicación

```
login → otp → vote → success
  ↑              ↓
  └──────────────┘  (reiniciar demo)
```

Cada transición se produce solo si la llamada al mock-api resuelve sin error. El estado y la lógica de negocio viven exclusivamente en `page.tsx`.

**Límites de intentos:**
- Login: máximo 5 fallidos → formulario bloqueado
- OTP: máximo 3 fallidos → regreso forzado a login

**Expiración por inactividad:** 5 minutos sin interacción en estados `otp` o `vote` → reseteo automático a login.

---

## UI / Experiencia

| Funcionalidad | Descripción |
|---|---|
| Validador RUT en tiempo real | Algoritmo módulo 11 inline — ✓ verde si válido, ✗ rojo si no |
| Formato RUT con puntos | `12345678` → `12.345.678-9` en el indicador (estado interno sin puntos) |
| OTP 6 cajas | Auto-avance, backspace inteligente, flechas ← →, pegado distribuido |
| Modal de confirmación | Muestra candidatura antes de emitir — cancelable |
| Transiciones entre pasos | Slide derecha al avanzar, slide izquierda al retroceder |
| Skeleton loaders exactos | Placeholders con la geometría real de VotingView (timer, tarjetas, botón) |
| Barra de progreso | 3 pasos con checkmarks SVG animados y línea conectora |
| Timer con urgencia | Neutro → amber (≤30s) → rojo (≤10s) |
| Spinners en botones | Feedback inmediato en cada acción asíncrona |
| SuccessView | Check SVG animado + candidatura elegida + comprobante `SLEP-XX-XXXXXXXX` |
| Escudo SVG institucional | Header de banda azul con tres capas y checkmark interno |

---

## Seguridad

### Headers HTTP

| Header | Valor | Protección |
|---|---|---|
| `Content-Security-Policy` | nonce-based + strict-dynamic + report-uri | XSS, inyección de scripts |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Downgrade HTTPS |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuga de URL |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), display-capture=()` | APIs de hardware |
| `Cross-Origin-Opener-Policy` | `same-origin` | Spectre / window.opener |
| `Cross-Origin-Resource-Policy` | `same-origin` | Embedding de recursos |

### Rate limiting

- **Por IP (middleware Edge):** 20 requests / 60 segundos → `429 Too Many Requests`
- **Login:** 5 intentos fallidos → formulario bloqueado
- **OTP:** 3 intentos fallidos → regreso forzado a login

### Inputs

- RUT número: allowlist `[0-9]` + `pattern="[0-9]*"` + `inputMode="numeric"`
- RUT dígito: allowlist `[0-9kK]` + `inputMode="text"`
- OTP: allowlist `[0-9]` por caja + `pattern="[0-9]*"` + `autoComplete="one-time-code"`
- Email: `type="email"` + `maxLength={254}`

---

## Cosas que NO hacer

- **No mover la CSP a `next.config.mjs`** — pierde el nonce y bloquea los chunks en producción.
- **No hacer `layout.tsx` estático** — debe llamar `await headers()` para que Next.js inyecte el nonce en los scripts.
- **No usar `setInterval` para el timer** — usar `setTimeout` recursivo para evitar drift y doble-disparo en StrictMode.
- **No llamar `getCandidates()` en el mount inicial** — solo tras OTP exitoso.
- **No exponer credenciales en la UI** — ni hints, ni placeholders con valores reales.
- **No guardar el RUT con puntos en el estado** — el formato con puntos es solo visual en el indicador.

---

## Estado del proyecto

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | Frontend con mock data — UX y diseño | ✅ |
| Fase 1b | Seguridad frontend: CSP nonce, HSTS, rate limiting, receiptCode | ✅ |
| Fase 2 | Testing: Vitest + RTL + Playwright E2E | ✅ |
| Fase 2b | Mejoras visuales: progress bar, skeletons, spinners, animaciones, SuccessView | ✅ |
| Fase 2c | UX avanzado: validador RUT, OTP 6 cajas, modal confirmación, transiciones slide, fix CSP Vercel | ✅ |
| Fase 2d | Seguridad avanzada: rate limiting IP, report-uri, COOP/CORP, Permissions-Policy extendida, allowlist inputs, expiración por inactividad | ✅ |
| Fase 3 | Backend: autenticación real, envío de correo, base de datos | ⬜ |
| Fase 4 | Despliegue producción: Vercel + BD serverless | ⬜ |

Ver [`context.md`](./context.md) para documentación técnica completa.

---

## Repositorio

[https://github.com/kmilomore/VOTACIONES](https://github.com/kmilomore/VOTACIONES)

---

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:3000)
npm run dev

# Build de producción
npm run build
```

> **Nota:** Las credenciales de prueba del mock viven únicamente en `src/lib/mock-api.ts` y no se muestran en la UI.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en puerto 3000 |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Lint con ESLint |
| `npm run test` | Tests unitarios (Vitest + RTL) |
| `npm run test:e2e` | Tests E2E (Playwright) |

---

## Estructura del proyecto

```
src/
├── middleware.ts        # CSP nonce-based por request (Edge Runtime)
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Orquestador — máquina de estados (login→otp→vote→success)
│   └── globals.css         # Sistema de diseño institucional
├── components/
│   └── views/
│       ├── LoginView.tsx   # Paso 1: RUT + email
│       ├── OtpView.tsx     # Paso 2: código OTP
│       ├── VotingView.tsx  # Paso 3: papeleta + temporizador
│       └── SuccessView.tsx # Paso 4: confirmación
├── lib/
│   └── mock-api.ts         # Simulación de backend
└── types/
    └── index.ts            # Interfaces TypeScript
```

---

## Stack

- **Next.js 15** — App Router
- **React 19** — Client Components
- **TypeScript 5** — modo estricto
- **CSS puro** — sin Tailwind ni librerías de UI externas

---

## UI / Experiencia

- **Barra de progreso** — tres pasos visuales (Identificacion → Verificacion → Papeleta) con checkmarks animados
- **Transiciones** — `fade + slide` al cambiar de vista vía `key={appState}`
- **Skeleton loaders** — shimmer animado mientras se carga la papeleta
- **Spinners en botones** — feedback inmediato en cada acción asíncrona
- **Timer con urgencia** — cambia a amber (≤30s) y rojo (≤10s) antes de expirar
- **Candidatos completos** — cada tarjeta muestra nombre, cargo y eslogan
- **SuccessView** — check SVG animado, candidatura elegida destacada, comprobante en `<code>` monoespaciado
- **Escudo SVG** — identidad institucional en el header de la banda azul

---

## Seguridad

- **CSP nonce-based** — `src/middleware.ts` genera un nonce criptográfico por request. En producción no hay `unsafe-inline` ni `unsafe-eval`.
- **HSTS** — `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- **Sin credenciales expuestas** — Los hints de prueba se eliminaron de la UI. No existen en el bundle de producción.
- **Rate limiting frontend** — 5 intentos de login y 3 de OTP antes de bloquear.
- **receiptCode seguro** — Generado con `crypto.randomUUID()`, no con timestamp.
- **Candidatos protegidos** — La lista de candidatos solo se carga tras verificación OTP exitosa.

---

## Estado del proyecto

Fase 2b completada (mejoras visuales: animaciones, skeletons, barra de progreso, spinners, SuccessView rediseñada). Ver [`context.md`](./context.md) para documentación técnica completa y roadmap de fases.

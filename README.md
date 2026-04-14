# Portal de Votación — SLEP Santiago Centro

Portal web institucional para la emisión de votos del Consejo Local del Servicio Local de Educación Pública (SLEP) Santiago Centro. Construido con **Next.js 15**, **React 19** y **TypeScript**.

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

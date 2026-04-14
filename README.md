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

## Seguridad

- **CSP nonce-based** — `src/middleware.ts` genera un nonce criptográfico por request. En producción no hay `unsafe-inline` ni `unsafe-eval`.
- **HSTS** — `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- **Sin credenciales expuestas** — Los hints de prueba se eliminaron de la UI. No existen en el bundle de producción.
- **Rate limiting frontend** — 5 intentos de login y 3 de OTP antes de bloquear.
- **receiptCode seguro** — Generado con `crypto.randomUUID()`, no con timestamp.
- **Candidatos protegidos** — La lista de candidatos solo se carga tras verificación OTP exitosa.

---

## Estado del proyecto

Fase 1b completada (frontend + hardening de seguridad). Ver [`context.md`](./context.md) para documentación técnica completa y roadmap de fases.

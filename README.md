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

---

## Credenciales de prueba

| Campo | Valor |
|---|---|
| RUT | `12345678-9` |
| Correo | `usuario@slep.cl` |
| OTP | `123456` |

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

## Estado del proyecto

Fase 1 — Frontend con mock data. Ver [`context.md`](./context.md) para documentación técnica completa y roadmap de fases.

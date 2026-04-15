# Contexto técnico — Portal de Votación del Consejo Local

## Descripción general

Portal web institucional para la emisión de votos del **Consejo Local del Servicio Local de Educación Pública (SLEP) COLCHAGUA**. La aplicación implementa un flujo guiado de 5 pantallas: orientación inicial, identificación por RUT, verificación OTP, papeleta digital con temporizador y confirmación de voto.

---

## Fase actual: Frontend robustecido con BFF en Next.js

El proyecto ya no expone la logica sensible directamente al cliente. La UI mantiene el flujo y la experiencia, mientras que Next.js aporta una capa servidor intermedia para autenticacion, OTP, padron y emision de voto.

**Fase actual** de un desarrollo en etapas. El objetivo de esta fase es validar:
- Flujo de usuario completo (UX) de extremo a extremo
- Máquina de estados y transiciones
- Diseño institucional y accesibilidad
- Componentes aislados y reutilizables
- Contrato estable entre cliente y capa servidor

El backend real (base de datos, autenticacion segura, envio de correo) sigue siendo responsabilidad de cada Servicio Local. Para desarrollo local, `src/lib/mock-api.ts` funciona como backend de prueba, pero ahora se ejecuta solo a traves de rutas servidor en `src/app/api/**`.

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 15.x | Framework — App Router |
| React | 19.x | UI — Client Components |
| TypeScript | 5.x | Tipado estricto |
| Tailwind CSS | 4.x | Estilos + utilidades |

Sin librerias de UI externas (no MUI, no shadcn). El sistema de diseño esta definido en `src/app/globals.css` y utilidades de Tailwind.

---

## Arquitectura de archivos

```
src/
├── app/
│   ├── layout.tsx          # Root layout — metadatos, font, globals.css
│   ├── page.tsx            # Orquestador principal (Client Component) — intro, guardas de flujo y vistas
│   └── api/                # Route Handlers — BFF interno del flujo
│   └── globals.css         # Variables CSS, paleta institucional, componentes
├── components/
│   └── views/              # Vistas aisladas, una por cada estado del flujo
│       ├── IntroView.tsx   # Pantalla inicial — orientación previa, simulación guiada y contraste alto
│       ├── LoginView.tsx   # Paso 1: RUT (número + dígito verificador) + email
│       ├── OtpView.tsx     # Paso 2: código OTP de 6 dígitos + tarjeta de usuario anonimizada
│       ├── VotingView.tsx  # Paso 3: papeleta + temporizador 120s + CTA sticky + modal de confirmación
│       └── SuccessView.tsx # Paso 4: confirmación animada + código de comprobante + estado demo
├── lib/
│   ├── api-client.ts       # Cliente HTTP consumido por la UI
│   ├── mock-api.ts         # Simulación de backend para desarrollo local, usada en servidor
│   └── server-session.ts   # Cookie httpOnly y sesión temporal del flujo
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
'intro' → 'login' → 'otp' → 'vote' → 'success'
             ↑                    ↓
             └────────────────────┘  (reiniciar demo)
```

El estado vive en `src/app/page.tsx` como `useState<AppState>('intro')`. Cada transición se produce solo si la llamada a `src/lib/api-client.ts` y a las rutas servidor resuelve sin error. El orquestador además impide transiciones inválidas entre estados para evitar saltos visuales inconsistentes.

**Límites de intentos:**
- Login: máximo 5 intentos fallidos → formulario bloqueado
- OTP: máximo 3 intentos fallidos → regreso forzado a login

---

## Interfaces TypeScript

```typescript
// src/types/index.ts

type Estamento = 'directivos' | 'docentes' | 'asistentes';

interface User {
  fullName: string;
  organization: string;
  estamento: Estamento;       // padrón al que pertenece el votante
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  slogan: string;
  initials: string;
  accentColor: string;
  estamento: Estamento;       // padrón al que pertenece el candidato
}

type AppState = 'intro' | 'login' | 'otp' | 'vote' | 'success';
```

---

## Capa servidor y contrato

La aplicacion utiliza Route Handlers de Next.js como BFF interno para desacoplar la UI de la logica sensible. Esa capa existe como referencia tecnica para la maqueta, pero no debe leerse como backend productivo.

Todo lo que depende de:

- autenticacion,
- OTP,
- sesion,
- padron,
- voto,
- auditoria,
- admin,
- persistencia,
- seguridad operativa,

queda centralizado y documentado en `BACKEND_CONTRACT.md`.

Este archivo `context.md` se concentra en arquitectura, componentes, flujo visual y decisiones de frontend. Si un Servicio Local necesita entender que debe reemplazar o implementar del lado servidor, la referencia correcta es `BACKEND_CONTRACT.md`.

---

## Candidatos registrados por estamento

### Directivos (3 candidatos)

| Nombre | Iniciales | Color | Rol |
|---|---|---|---|
| Pablo Reyes | PR | `#1a4a7a` | Director establecimiento zona norte |
| Claudia Fuentes | CF | `#4a1a5a` | Directora establecimiento zona sur |
| Rodrigo Espinoza | RE | `#1a5a3a` | Jefe de Unidad Técnico-Pedagógica |

### Docentes (4 candidatos)

| Nombre | Iniciales | Color | Rol |
|---|---|---|---|
| Marisol Huerta | MH | `#8c4f2f` | Representante de estamento docente |
| Vianka Mejías | VM | `#355c7d` | Representante de gestión territorial |
| Ximena Pino | XP | `#44633f` | Representante de convivencia y bienestar |
| Jorge Barahona | JB | `#6f4b8b` | Representante de innovación pública |

### Asistentes de la Educación (3 candidatos)

| Nombre | Iniciales | Color | Rol |
|---|---|---|---|
| Carmen Lagos | CL | `#7a3a1a` | Representante de asistentes zona oriente |
| Miguel Torres | MT | `#1a6a6a` | Representante técnico-administrativo |
| Patricia Vera | PV | `#5a4a1a` | Representante de auxiliares de educación |

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
| `.bg-portal` | Wrapper raíz con fondo `fondo.webp` |
| `.candidate-badge` | Badge circular con color de acento del candidato (`color-mix`) |
| `.candidate-selected` | Estado seleccionado de tarjeta de candidato |
| `.view-enter-forward` | Slide desde la derecha al avanzar entre pasos (0.25s ease-out) |
| `.view-enter-back` | Slide desde la izquierda al retroceder entre pasos (0.25s ease-out) |
| `.skeleton` | Shimmer animado para skeleton loaders (1.4s infinito) |
| `.btn-spinner` | Spinner SVG circular para estado de carga en botones |
| `.check-circle` | Contenedor del check con animación `scale` de entrada |
| `.check-path` | Trazo SVG del check con animación `stroke-dashoffset` |
| `.modal-backdrop` | Overlay del modal de confirmación (fixed, blur, z-50) |
| `.modal-panel` | Panel del modal con animación spring de entrada |
| `.portal-contrast-high` | Overrides de alto contraste para fondos, texto, inputs, botones y estados |

### IntroView — Orientación previa

Antes del login, la aplicación muestra una pantalla breve con:
- lista de elementos necesarios para completar el proceso,
- activación de **modo simulación guiada**,
- activación de **contraste alto institucional**,
- recordatorio visible del canal de soporte durante la jornada.

La intención es reducir dudas antes del primer input y evitar que el usuario entre al flujo sin contexto mínimo.

### Lógica de padrón por estamento

Cada usuario pertenece a un padrón (`estamento`). La papeleta que ve el votante contiene **únicamente los candidatos de su propio padrón**.

**Flujo de datos:**
1. `page.tsx` envia RUT y correo al BFF interno mediante `api-client.ts`.
2. `POST /api/auth/verify-credentials` valida la identidad y crea una sesion httpOnly.
3. `POST /api/auth/verify-otp` valida el OTP del usuario autenticado en servidor.
4. `GET /api/candidates` obtiene el padron desde la sesion y devuelve solo los candidatos habilitados.
5. `VotingView` recibe `estamento` y muestra el badge "Padrón: Docentes / Directivos / Asistentes".

**Colores por estamento:**

| Estamento | Color |
|---|---|
| `directivos` | `#1a4a7a` (azul institucional oscuro) |
| `docentes` | `#8c4f2f` (café terracota) |
| `asistentes` | `#1a6a6a` (verde azulado) |

### OtpView — Tarjeta del usuario autenticado

Despues de login exitoso, la vista OTP muestra una tarjeta con:
- Avatar con iniciales del nombre (2 letras) con color del estamento.
- Nombre parcialmente anonimizado + organización.
- Badge de estamento con color propio (fondo claro, borde, texto del color del estamento).

El correo mostrado en las instrucciones también se presenta enmascarado para disminuir exposición visual innecesaria.

### VotingView — Badge de padrón en la papeleta

El encabezado de la papeleta muestra el nombre del votante acompañado de un badge "Padrón: {estamento}" con el color del estamento correspondiente, dejando claro a qué papeleta pertenece.

Si el usuario activó modo simulación, la vista agrega además un badge **Simulación guiada** para evitar ambigüedad con una jornada real.

### Barra de progreso de pasos

Implementada en `page.tsx` como componente inline (no vista separada). Renderiza los 3 pasos del flujo (Identificacion → Verificacion → Papeleta) con:
- Círculos numerados que pasan a checkmark (SVG) al completarse.
- Línea conectora que se rellena en `--color-brand` al avanzar.
- Oculta en el estado `success`.

Entre la barra y la vista activa, `page.tsx` inyecta una franja breve de ayuda contextual del paso actual con la acción siguiente esperada.

### LoginView — Validación de RUT en tiempo real

- Implementa el algoritmo módulo 11 del RUT chileno (`validateRut`) directamente en el componente.
- Muestra un indicador inline debajo del campo: ✓ verde con formato `12.345.678-9` si es válido, ✗ rojo si el dígito verificador no coincide.
- Solo se muestra cuando ambos campos (número + dígito) tienen valor.
- `formatRutNumber` formatea con puntos únicamente en el indicador; el estado interno guarda el número sin puntos.

### OtpView — 6 cajas separadas

- Reemplaza el input único por 6 campos individuales gestionados con `useRef`.
- **Auto-avance:** al escribir un dígito el foco pasa al siguiente campo automáticamente.
- **Backspace inteligente:** si el campo está vacío, borra el campo anterior y vuelve el foco.
- **Navegación con flechas:** ← → mueven el foco entre cajas.
- **Pegado:** `onPaste` distribuye hasta 6 dígitos en las cajas y posiciona el foco correctamente.
- El botón de submit se deshabilita hasta que los 6 dígitos estén completos.
- `autoComplete="one-time-code"` en la primera caja para sugerencia del browser.

### VotingView — Modal de confirmación

- Al hacer clic en «Confirmar voto →» se abre un modal (`.modal-backdrop` + `.modal-panel`) en lugar de enviar directamente.
- El modal muestra la candidatura seleccionada (badge de color + nombre + rol).
- Botones: **Cancelar** (cierra el modal) y **Emitir voto →** (llama a `onSubmitVote`).
- Clic fuera del panel cierra el modal.
- Estado `showConfirmModal` es local al componente (`useState`).

En móvil, el CTA principal de confirmación se mantiene dentro de una banda sticky inferior para reducir scroll adicional antes del cierre del voto.

### Animaciones de transición entre pasos

- `page.tsx` mantiene `transitionDirection: 'forward' | 'back'` en estado.
- Avanzar (→): aplica `.view-enter-forward` (slide desde la derecha).
- Retroceder (←): aplica `.view-enter-back` (slide desde la izquierda).
- `handleBackToLogin` y `handleRestart` setean `'back'` antes del cambio de estado.

### Skeleton loaders con forma exacta

El skeleton de carga de papeleta replica la geometría real del `VotingView`:
- Fila superior: bloque de texto (3 líneas) + placeholder rectangular del timer (`120×66px`).
- Grid de tarjetas: badge circular + línea de nombre (22px) + rol + 2 líneas de slogan.
- Fila inferior: placeholder del botón «Confirmar voto».

---

## Mejoras recientes de frontend pulido

### Contraste alto institucional

- Activable desde la pantalla inicial y desde la banda superior del portal.
- Sobrescribe fondos, textos, inputs, botones, badges, tarjetas seleccionadas y estados de alerta.
- Está pensado para jornadas presenciales, monitores de baja calidad o usuarios que requieren una paleta más dura.

### Modo simulación guiada

- Permite recorrer el flujo con señalización visual de demo.
- Mantiene etiquetas visibles en intro, papeleta y pantalla final.
- Sirve para capacitación y validación de UX sin confundir el recorrido con operación real.

### Soporte visible en UI

- La aplicación mantiene una franja persistente recordando el canal de apoyo o mesa de ayuda del establecimiento.
- El objetivo es que el soporte no dependa de un manual externo ni de memoria del operador.

### Guardas y resiliencia del lado cliente

- Detección de múltiples pestañas mediante `BroadcastChannel`.
- Advertencia previa a la expiración por inactividad con countdown y opción de mantener la sesión activa.
- Limpieza de sesión al volver desde caché del navegador (`pageshow persisted`).
- Protección contra doble envío en acciones críticas.
- Reinicio defensivo si el cliente detecta estados imposibles, por ejemplo `vote` sin usuario o `success` sin comprobante.

---

## Fix de producción — CSP + renderizado dinámico (`layout.tsx`)

**Problema:** en Vercel los chunks `_next/static/chunks/*.js` eran bloqueados por CSP porque Next.js los inyectaba en el HTML sin el atributo `nonce`.

**Causa raíz:** `layout.tsx` era un Server Component estático; Next.js no podía leer el nonce generado por el middleware Edge.

**Solución aplicada:** `layout.tsx` llama `await headers()` de `next/headers`. Esto fuerza renderizado dinámico por request, lo que permite que Next.js 15 lea el header `x-nonce` e inyecte `nonce="..."` en todos los `<script>` tags generados.

---

## Bugs de producción corregidos (Fase 2e)

| Bug | Causa | Fix |
|---|---|---|
| Timer `useEffect` sin apertura | El `useEffect(() => {` del countdown faltaba — su cuerpo quedó flotando fuera de cualquier hook | Separar correctamente el idle-timeout effect y el countdown effect, cada uno con su propio `useEffect` y dependency array |
| `idleTimer: ReturnType<typeof window.setTimeout>` | En el build de Next.js `@types/node` está presente — `window.setTimeout` resuelve a `NodeJS.Timeout` en vez de `number`, causando conflicto de tipos | Declarar `let idleTimer: number` explícitamente (tipo DOM correcto) |

---

## Seguridad implementada (Fases 1b + 2d)

### Headers HTTP

Gestionados en dos capas:

| Capa | Archivo | Headers |
|---|---|---|
| Estáticos | `next.config.mjs` | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` |
| Dinámicos | `src/middleware.ts` | `Content-Security-Policy` (nonce por request), rate limiting por IP |

### Content Security Policy

- En **desarrollo**: `unsafe-inline` + `unsafe-eval` para compatibilidad con Fast Refresh de Next.js.
- En **producción**: `nonce-{nonce} + strict-dynamic`. Nonce generado con `crypto.randomUUID()` por cada request en el middleware Edge.
- `report-uri /api/csp-report` activo en producción — recibe violaciones sin bloquear nada.

### Rate limiting

| Capa | Mecanismo | Límite | Consecuencia |
|---|---|---|---|
| Middleware Edge (IP) | `Map` en memoria — 20 req/min por IP | 20 requests/60s | `429 Too Many Requests` + `Retry-After: 60` |
| Login (frontend) | `loginAttempts` en estado React | 5 intentos fallidos | Formulario bloqueado (`isLocked=true`) |
| OTP (frontend) | `otpAttempts` en estado React | 3 intentos fallidos | Regreso forzado a login + reseteo de estado |

> **Nota:** El rate limiter de middleware usa `Map` en memoria por instancia Edge — suficiente para Fase 2d. Para producción real, migrar a Vercel KV.

### Expiración de sesión por inactividad

- Timeout: **5 minutos** sin interacción del usuario.
- Activo únicamente en estados `otp` y `vote`.
- Eventos que reinician el timer: `mousemove`, `keydown`, `pointerdown`, `touchstart`.
- Advertencia visual previa: **60 segundos** antes de expirar.
- Al expirar: resetea a `login`, limpia `otp` y `user`, muestra mensaje explicativo.
- Implementado con `useEffect` + `window.setTimeout` (limpiado correctamente en cleanup).

### Sanitización de inputs

| Campo | Allowlist | Atributos HTML |
|---|---|---|
| RUT — número | Solo dígitos `[0-9]`, máx 8 chars | `inputMode="numeric"`, `pattern="[0-9]*"` |
| RUT — dígito verificador | Solo `[0-9kK]`, máx 1 char | `inputMode="text"` |
| OTP | Solo dígitos `[0-9]`, máx 1 por caja | `inputMode="numeric"`, `pattern="[0-9]*"` |
| Email | Nativo `type="email"` + `maxLength={254}` | `autoComplete="email"` |

### Headers de aislamiento

| Header | Valor | Protección |
|---|---|---|
| `Cross-Origin-Opener-Policy` | `same-origin` | Previene ataques `window.opener` / Spectre |
| `Cross-Origin-Resource-Policy` | `same-origin` | Impide embeber recursos desde otros orígenes |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), display-capture=()` | Deshabilita APIs de hardware sensibles |
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `X-Content-Type-Options` | `nosniff` | Previene MIME sniffing |

### Integridad del estado

- `getCandidates()` solo se invoca tras verificacion OTP exitosa (no en mount inicial).
- El cliente consume `api-client.ts`; no importa el mock directamente.
- El modelo `User` expuesto al cliente no contiene RUT, email ni OTP.
- El flujo inicia en `intro` y no permite saltos arbitrarios entre estados.
- Al retroceder desde OTP, se limpian `otp`, `user` y ambos contadores.
- `handleRestart()` limpia todos los campos — sin pre-relleno de credenciales de prueba.
- `receiptCode` usa `crypto.randomUUID()` — no timestamp predecible.
- Al cerrar, recargar o abandonar la página, el cliente intenta invalidar la sesión con `DELETE /api/session` usando `keepalive`.
- Si el usuario vuelve desde caché del navegador, la UI reinicia el flujo para evitar datos visualmente obsoletos.
- Si se detecta otra pestaña activa del portal, la interfaz muestra advertencia para continuar en una sola.

### Cosas que NO hacer en este proyecto

> Lista de prácticas prohibidas para futuros colaboradores:

- **No exponer credenciales de prueba en la UI** — ni hints, ni placeholders con valores reales.
- **No mover la CSP a `next.config.mjs` como header estático** — pierde el nonce y bloquea los chunks en producción.
- **No hacer `layout.tsx` estático** — debe llamar `await headers()` para forzar renderizado dinámico y que Next.js inyecte el nonce.
- **No usar `setInterval` para el timer** — el proyecto usa `setTimeout` recursivo para evitar drift y doble-disparos en StrictMode.
- **No eliminar las guardas de transición del flujo** — el cliente debe impedir saltos visuales inconsistentes entre estados.
- **No llamar `getCandidates()` en el mont inicial** — solo debe llamarse tras OTP exitoso.
- **No bypassear el rate limiter** deshabilitando el middleware en rutas sensibles.
- **No guardar el RUT con puntos en el estado** — el formato con puntos es solo para visualización en el indicador.
- **No pasar candidatos de un estamento a la vista de otro** — el servidor debe resolver siempre el padron desde la sesion autenticada.
- **No consumir `mock-api.ts` desde componentes cliente** — la llamada debe pasar por el BFF interno.
- **No usar `server-session.ts` en produccion tal como esta** — migrar a Redis, KV o base de datos compartida.
- **No mostrar correo o identidad completa sin necesidad visual** — la UI actual usa masking parcial en OTP e instrucciones.

---

## Temporizador de votación

- Duración: **120 segundos**
- Se inicia al entrar a `VotingView` (estado `vote`)
- Implementado con `useEffect` + `window.setTimeout` (no `setInterval`)
- Al llegar a 0, el botón "Confirmar voto" se deshabilita y aparece mensaje de sesión expirada

### Estados visuales del temporizador

| Segundos restantes | Color | Fondo |
|---|---|---|
| > 30 | `text-ink` (neutro) | blanco |
| ≤ 30 | `text-amber-700` | `bg-amber-50` |
| ≤ 10 | `text-red-600` | `bg-red-50` |
| 0 (expirado) | `text-red-600` | `bg-red-50` |

---

## Roadmap de fases

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | Frontend con mock data — validación UX y diseño | ✅ Completado |
| Fase 1b | Auditoría de seguridad frontend (CSP nonce, HSTS, rate limiting, receiptCode seguro) | ✅ Completado |
| Fase 2 | Testing (Vitest + RTL unit tests · Playwright E2E) | ✅ Completado |
| Fase 2b | Mejoras visuales: barra de progreso, skeletons, spinners, animaciones, escudo SVG, SuccessView rediseñada, role/slogan en candidatos, timer con urgencia | ✅ Completado |
| Fase 2c | UX avanzado: validador RUT en tiempo real, OTP 6 cajas, modal de confirmación, transiciones slide, skeletons exactos, fix CSP Vercel | ✅ Completado |
| Fase 2d | Seguridad avanzada: rate limiting por IP, CSP report-uri, COOP/CORP headers, Permissions-Policy extendida, allowlist inputs, expiración por inactividad | ✅ Completado |
| Fase 2e | Padrones por estamento: 3 usuarios ficticios, candidatos por padrón, OtpView con tarjeta de usuario, VotingView con badge de padrón, filtro dinámico de papeleta | ✅ Completado |
| Fase 2f | Pulido UX frontend: IntroView, simulación guiada, contraste alto, soporte visible, guardas de sesión y advertencias multi-pestaña | ✅ Completado |
| Fase 3 | Backend: autenticación real, envío de correo, base de datos | ⬜ Pendiente |
| Fase 4 | Despliegue en producción (Vercel + BD serverless) | ⬜ Pendiente |

---

## Repositorio

[https://github.com/kmilomore/VOTACIONES](https://github.com/kmilomore/VOTACIONES)

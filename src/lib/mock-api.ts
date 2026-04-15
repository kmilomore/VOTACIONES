import type { Candidate, Estamento, User } from '@/types';

interface MockUserRecord extends User {
  rut: string;
  email: string;
  otp: string;
  /** ID matching a school in src/lib/schools-data.ts SCHOOLS array */
  schoolId: string;
}

// ---------------------------------------------------------------------------
// Usuarios ficticios de prueba — uno por estamento
// ---------------------------------------------------------------------------
// RUT 12345678-5 → Directivos
// RUT 16940271-k → Docentes
// RUT 19876543-0 → Asistentes de la Educación
// ---------------------------------------------------------------------------
const VALID_USERS: MockUserRecord[] = [
  {
    rut: '12345678-5',
    email: 'director@slep.cl',
    otp: '111111',
    fullName: 'Carlos Muñoz Reyes',
    organization: 'SLEP COLCHAGUA',
    estamento: 'directivos',
    schoolId: 'roberto-humeres',
  },
  {
    rut: '16940271-k',
    email: 'docente@slep.cl',
    otp: '222222',
    fullName: 'María González Pérez',
    organization: 'SLEP COLCHAGUA',
    estamento: 'docentes',
    schoolId: 'martin-prado',
  },
  {
    rut: '19876543-0',
    email: 'asistente@slep.cl',
    otp: '333333',
    fullName: 'Ana Soto Vidal',
    organization: 'SLEP COLCHAGUA',
    estamento: 'asistentes',
    schoolId: 'costa-rica',
  },
];

export const candidates: Candidate[] = [
  // ── Directivos ────────────────────────────────────────────────────────────
  {
    id: 'pablo-reyes',
    name: 'Pablo Reyes',
    role: 'Director establecimiento zona norte',
    slogan: 'Liderazgo pedagógico centrado en resultados colectivos.',
    initials: 'PR',
    accentColor: '#1a4a7a',
    estamento: 'directivos',
  },
  {
    id: 'claudia-fuentes',
    name: 'Claudia Fuentes',
    role: 'Directora establecimiento zona sur',
    slogan: 'Gestión participativa para comunidades escolares fuertes.',
    initials: 'CF',
    accentColor: '#4a1a5a',
    estamento: 'directivos',
  },
  {
    id: 'rodrigo-espinoza',
    name: 'Rodrigo Espinoza',
    role: 'Jefe de Unidad Técnico-Pedagógica',
    slogan: 'Innovación curricular con base en evidencia educativa.',
    initials: 'RE',
    accentColor: '#1a5a3a',
    estamento: 'directivos',
  },
  // ── Docentes ─────────────────────────────────────────────────────────────
  {
    id: 'marisol-huerta',
    name: 'Marisol Huerta',
    role: 'Escuela Matrin Prado',
    slogan: 'Participacion informada con foco en continuidad pedagogica.',
    initials: 'MH',
    accentColor: '#8c4f2f',
    estamento: 'docentes',
  },
  {
    id: 'vianka-mejias',
    name: 'Vianka Mejias',
    role: 'Colegio República de Costa Rica',
    slogan: 'Coordinacion intersectorial para escuelas mas conectadas.',
    initials: 'VM',
    accentColor: '#355c7d',
    estamento: 'docentes',
  },
  {
    id: 'ximena-pino',
    name: 'Ximena Pino',
    role: 'Liceo José Victorino Lastarria',
    slogan: 'Vinculos de confianza para comunidades escolares solidas.',
    initials: 'XP',
    accentColor: '#44633f',
    estamento: 'docentes',
  },
  {
    id: 'jorge-barahona',
    name: 'Jorge Barahona',
    role: 'Liceo Carmela Carvajal de Prat',
    slogan: 'Procesos simples y transparentes al servicio del territorio.',
    initials: 'JB',
    accentColor: '#6f4b8b',
    estamento: 'docentes',
  },
  // ── Asistentes de la Educación ────────────────────────────────────────────
  {
    id: 'carmen-lagos',
    name: 'Carmen Lagos',
    role: 'Colegio República de Costa Rica',
    slogan: 'Reconocimiento y valoración del trabajo asistencial.',
    initials: 'CL',
    accentColor: '#7a3a1a',
    estamento: 'asistentes',
  },
  {
    id: 'miguel-torres',
    name: 'Miguel Torres',
    role: 'Colegio de Aplicación Artística y Cultural',
    slogan: 'Coordinación efectiva entre equipos de apoyo escolar.',
    initials: 'MT',
    accentColor: '#1a6a6a',
    estamento: 'asistentes',
  },
  {
    id: 'patricia-vera',
    name: 'Patricia Vera',
    role: 'Liceo de Aplicación Pablo Neruda',
    slogan: 'Condiciones dignas y reconocimiento para todos los estamentos.',
    initials: 'PV',
    accentColor: '#5a4a1a',
    estamento: 'asistentes',
  },
];

const MIN_DELAY_MS = 700;
const MAX_DELAY_MS = 1400;

function wait(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function randomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
}

function normalizeRut(rut: string) {
  return rut.replace(/\./g, '').trim().toLowerCase();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: MockUserRecord): User {
  return {
    fullName: user.fullName,
    organization: user.organization,
    estamento: user.estamento,
  };
}

export function getMockUserByRut(rut: string): MockUserRecord | null {
  const normalizedRut = normalizeRut(rut);

  return VALID_USERS.find((user) => normalizeRut(user.rut) === normalizedRut) ?? null;
}

export function getCandidateById(candidateId: string): Candidate | null {
  return candidates.find((candidate) => candidate.id === candidateId) ?? null;
}

export async function verifyUserCredentials(rut: string, email: string): Promise<MockUserRecord> {
  await wait(randomDelay());

  const normalizedRut = normalizeRut(rut);
  const normalizedEmail = normalizeEmail(email);

  const match = VALID_USERS.find(
    (u) =>
      normalizeRut(u.rut) === normalizedRut &&
      normalizeEmail(u.email) === normalizedEmail,
  );

  if (match) return match;

  throw new Error('No encontramos una coincidencia valida para el RUT y correo ingresados.');
}

export async function verifyOtpCode(otp: string, expectedOtp: string): Promise<void> {
  await wait(randomDelay());

  if (otp.trim() === expectedOtp.trim()) return;

  throw new Error('El codigo OTP no es valido o ha expirado.');
}

export async function getCandidates(estamento: Estamento): Promise<Candidate[]> {
  await wait(500);
  return candidates.filter((c) => c.estamento === estamento);
}

export async function submitVote(candidateId: string): Promise<{ receiptCode: string; candidate: Candidate }> {
  await wait(randomDelay());

  const candidate = getCandidateById(candidateId);

  if (!candidate) {
    throw new Error('No fue posible registrar el voto para la candidatura seleccionada.');
  }

  return {
    receiptCode: `SLEP-${candidate.initials}-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
    candidate,
  };
}

import type { Candidate, User } from '@/types';

const VALID_USER: User = {
  rut: '12345678-9',
  email: 'usuario@slep.cl',
  otp: '123456',
  fullName: 'Usuario de Prueba',
  organization: 'SLEP Santiago Centro',
};

export const candidates: Candidate[] = [
  {
    id: 'marisol-huerta',
    name: 'Marisol Huerta',
    role: 'Representante de estamento docente',
    slogan: 'Participacion informada con foco en continuidad pedagogica.',
    initials: 'MH',
    accentColor: '#8c4f2f',
  },
  {
    id: 'vianka-mejias',
    name: 'Vianka Mejias',
    role: 'Representante de gestion territorial',
    slogan: 'Coordinacion intersectorial para escuelas mas conectadas.',
    initials: 'VM',
    accentColor: '#355c7d',
  },
  {
    id: 'ximena-pino',
    name: 'Ximena Pino',
    role: 'Representante de convivencia y bienestar',
    slogan: 'Vinculos de confianza para comunidades escolares solidas.',
    initials: 'XP',
    accentColor: '#44633f',
  },
  {
    id: 'jorge-barahona',
    name: 'Jorge Barahona',
    role: 'Representante de innovacion publica',
    slogan: 'Procesos simples y transparentes al servicio del territorio.',
    initials: 'JB',
    accentColor: '#6f4b8b',
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

export async function verifyUserCredentials(rut: string, email: string): Promise<User> {
  await wait(randomDelay());

  const normalizedRut = normalizeRut(rut);
  const normalizedEmail = normalizeEmail(email);

  if (
    normalizedRut === normalizeRut(VALID_USER.rut) &&
    normalizedEmail === normalizeEmail(VALID_USER.email)
  ) {
    return VALID_USER;
  }

  throw new Error('No encontramos una coincidencia valida para el RUT y correo ingresados.');
}

export async function verifyOtpCode(otp: string): Promise<string> {
  await wait(randomDelay());

  if (otp.trim() === VALID_USER.otp) {
    return VALID_USER.otp;
  }

  throw new Error('El codigo OTP no es valido o ha expirado.');
}

export async function getCandidates(): Promise<Candidate[]> {
  await wait(500);
  return candidates;
}

export async function submitVote(candidateId: string): Promise<{ receiptCode: string; candidate: Candidate }> {
  await wait(randomDelay());

  const candidate = candidates.find((item) => item.id === candidateId);

  if (!candidate) {
    throw new Error('No fue posible registrar el voto para la candidatura seleccionada.');
  }

  return {
    receiptCode: `SLEP-${candidate.initials}-${Date.now().toString().slice(-6)}`,
    candidate,
  };
}

export const demoCredentials = {
  rut: VALID_USER.rut,
  email: VALID_USER.email,
  otp: VALID_USER.otp,
};
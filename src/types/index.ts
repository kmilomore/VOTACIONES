export type Estamento = 'directivos' | 'docentes' | 'asistentes';

export interface User {
  fullName: string;
  organization: string;
  estamento: Estamento;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  slogan: string;
  initials: string;
  accentColor: string;
  estamento: Estamento;
}

export type AppState = 'intro' | 'login' | 'otp' | 'vote' | 'success';

// ---------------------------------------------------------------------------
// Admin metrics types
// ---------------------------------------------------------------------------

export interface CandidateResult {
  id: string;
  name: string;
  initials: string;
  accentColor: string;
  votes: number;
}

export interface EstamentoResult {
  estamento: Estamento;
  label: string;
  color: string;
  padronCount: number;
  votesCast: number;
  candidates: CandidateResult[];
}

export interface SchoolResult {
  id: string;
  name: string;
  shortName: string;
  padron: { directivos: number; docentes: number; asistentes: number };
  voted: { directivos: boolean; docentes: boolean; asistentes: boolean };
}

export interface AdminMetrics {
  lastUpdated: number;
  padron: { total: number; directivos: number; docentes: number; asistentes: number };
  votes: { total: number; directivos: number; docentes: number; asistentes: number };
  estamentos: EstamentoResult[];
  schools: SchoolResult[];
}

export type AdminAuditEvent =
  | 'login_success'
  | 'login_failure'
  | 'access'
  | 'logout'
  | 'lockout_blocked';

export interface AdminAuditEntry {
  ts: number;
  ip: string;
  event: AdminAuditEvent;
  detail?: string;
}
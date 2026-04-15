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

export type AppState = 'login' | 'otp' | 'vote' | 'success';
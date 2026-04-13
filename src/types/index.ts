export interface User {
  rut: string;
  email: string;
  otp: string;
  fullName: string;
  organization: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  slogan: string;
  initials: string;
  accentColor: string;
}

export type AppState = 'login' | 'otp' | 'vote' | 'success';
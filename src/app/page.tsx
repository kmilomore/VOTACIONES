'use client';

import { useEffect, useState } from 'react';

import { LoginView } from '@/components/views/LoginView';
import { OtpView } from '@/components/views/OtpView';
import { SuccessView } from '@/components/views/SuccessView';
import { VotingView } from '@/components/views/VotingView';
import {
  getCandidates,
  submitVote,
  verifyOtpCode,
  verifyUserCredentials,
} from '@/lib/mock-api';
import type { AppState, Candidate, User } from '@/types';

const VOTING_WINDOW_SECONDS = 120;
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_OTP_ATTEMPTS = 3;

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('login');
  const [rutNumber, setRutNumber] = useState('');
  const [rutVerifier, setRutVerifier] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [receiptCode, setReceiptCode] = useState('');
  const [confirmedCandidateName, setConfirmedCandidateName] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(VOTING_WINDOW_SECONDS);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  useEffect(() => {
    if (appState !== 'vote' || remainingSeconds <= 0) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setRemainingSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appState, remainingSeconds]);

  const hasExpired = remainingSeconds <= 0;
  const isLoginLocked = loginAttempts >= MAX_LOGIN_ATTEMPTS;
  const isOtpLocked = otpAttempts >= MAX_OTP_ATTEMPTS;
  const rut = rutNumber && rutVerifier ? `${rutNumber}-${rutVerifier}` : rutNumber;

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await verifyUserCredentials(rut, email);
      setUser(authenticatedUser);
      setOtpAttempts(0);
      setAppState('otp');
      setOtp('');
    } catch (error) {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);
      setErrorMessage(
        nextAttempts >= MAX_LOGIN_ATTEMPTS
          ? 'Demasiados intentos fallidos. Recarga la pagina para continuar.'
          : error instanceof Error ? error.message : 'No fue posible validar la identidad.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Step 1: verify OTP code
    try {
      await verifyOtpCode(otp);
    } catch (error) {
      const nextAttempts = otpAttempts + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        // Force back to login after too many failed OTP attempts
        setOtp('');
        setUser(null);
        setOtpAttempts(0);
        setLoginAttempts(0);
        setAppState('login');
        setErrorMessage('Demasiados intentos fallidos de OTP. Reinicia el proceso de autenticacion.');
      } else {
        setOtpAttempts(nextAttempts);
        setErrorMessage(error instanceof Error ? error.message : 'No fue posible validar el OTP.');
      }
      setIsSubmitting(false);
      return;
    }

    // Step 2: load candidates only after successful OTP
    setOtp('');
    setIsLoadingCandidates(true);
    try {
      const availableCandidates = await getCandidates();
      setCandidates(availableCandidates);
      setRemainingSeconds(VOTING_WINDOW_SECONDS);
      setSelectedCandidateId(null);
      setAppState('vote');
    } catch {
      setErrorMessage('No fue posible cargar la papeleta en este momento.');
    } finally {
      setIsLoadingCandidates(false);
      setIsSubmitting(false);
    }
  }

  async function handleVoteSubmit() {
    if (!selectedCandidateId) {
      setErrorMessage('Debes seleccionar una candidatura antes de votar.');
      return;
    }

    if (hasExpired) {
      setErrorMessage('La sesion ya expiro. Reinicia el flujo de autenticacion para continuar.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await submitVote(selectedCandidateId);
      setReceiptCode(result.receiptCode);
      setConfirmedCandidateName(result.candidate.name);
      setAppState('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible registrar el voto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestart() {
    setAppState('login');
    setRutNumber('');
    setRutVerifier('');
    setEmail('');
    setOtp('');
    setUser(null);
    setCandidates([]);
    setSelectedCandidateId(null);
    setReceiptCode('');
    setConfirmedCandidateName('');
    setRemainingSeconds(VOTING_WINDOW_SECONDS);
    setErrorMessage(null);
    setLoginAttempts(0);
    setOtpAttempts(0);
  }

  function handleBackToLogin() {
    setAppState('login');
    setOtp('');
    setUser(null);
    setLoginAttempts(0);
    setOtpAttempts(0);
    setErrorMessage(null);
  }

  return (
    <main className="relative min-h-screen overflow-hidden isolate font-serif">
      {/* Background image */}
      <div className="absolute inset-0 bg-portal" />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#062048]/85 via-[#082a54]/70 to-[#061836]/82" />

      {/* Centered content */}
      <section className="relative z-10 grid place-items-center min-h-screen max-w-[940px] mx-auto px-4 py-5">
        {/* Stage card */}
        <div className="w-full max-w-[560px] p-2.5 rounded-[20px] border border-white/20 bg-white/90 shadow-[0_24px_64px_rgba(6,18,38,0.36),0_4px_12px_rgba(6,18,38,0.14)] backdrop-blur-[22px] backdrop-saturate-150">

          {/* Institutional intro band */}
          <div className="relative mb-2 px-[18px] py-4 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-brand-deep via-brand-mid to-brand">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(255,255,255,0.06),transparent_55%)] pointer-events-none" />
            <p className="relative m-0 mb-1.5 text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-[rgba(200,220,255,0.88)]">
              Servicio Local de Educacion Publica
            </p>
            <h2 className="relative m-0 font-serif text-[clamp(20px,2.8vw,30px)] text-white leading-none tracking-tight">
              Portal de votacion del Consejo Local
            </h2>
            {/* TODO(backend-integration): replace description with production copy, remove 'datos simulados' reference */}
            <p className="relative mt-2 text-sm font-sans text-[rgba(210,228,255,0.82)] max-w-[48ch] leading-relaxed m-0">
              Una interfaz limpia para validar el flujo de acceso, autenticacion por OTP y emision de voto con datos simulados.
            </p>
          </div>

          {appState === 'login' ? (
            <LoginView
              rutNumber={rutNumber}
              rutVerifier={rutVerifier}
              email={email}
              isSubmitting={isSubmitting}
              isLocked={isLoginLocked}
              errorMessage={errorMessage}
              onRutNumberChange={setRutNumber}
              onRutVerifierChange={setRutVerifier}
              onEmailChange={setEmail}
              onSubmit={handleLoginSubmit}
            />
          ) : null}

          {appState === 'otp' ? (
            <OtpView
              email={email}
              otp={otp}
              isSubmitting={isSubmitting}
              isLocked={isOtpLocked}
              errorMessage={errorMessage}
              onOtpChange={setOtp}
              onBack={handleBackToLogin}
              onSubmit={handleOtpSubmit}
            />
          ) : null}

          {appState === 'vote' ? (
            isLoadingCandidates ? (
              <section className="rounded-2xl bg-white/95 border border-slate-900/10 text-ink p-5 min-h-[240px] grid content-start gap-2">
                <p className="m-0 text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-ink-muted">Cargando papeleta</p>
                <h1 className="m-0 font-serif text-[clamp(20px,2.6vw,28px)] text-ink leading-none tracking-tight">Preparando candidaturas</h1>
                <p className="m-0 text-sm text-ink-muted font-sans leading-relaxed">
                  Estamos organizando la informacion simulada antes de mostrar la votacion.
                </p>
              </section>
            ) : (
              <VotingView
                candidates={candidates}
                voterName={user?.fullName ?? 'Participante'}
                selectedCandidateId={selectedCandidateId}
                remainingSeconds={remainingSeconds}
                hasExpired={hasExpired}
                isSubmitting={isSubmitting}
                errorMessage={errorMessage}
                onSelectCandidate={(candidateId) => {
                  setSelectedCandidateId(candidateId);
                  setErrorMessage(null);
                }}
                onSubmitVote={handleVoteSubmit}
              />
            )
          ) : null}

          {appState === 'success' ? (
            <SuccessView
              voterName={user?.fullName ?? 'Participante'}
              candidateName={confirmedCandidateName}
              receiptCode={receiptCode}
              onRestart={handleRestart}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
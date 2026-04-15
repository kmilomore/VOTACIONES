'use client';

import React, { useEffect, useState } from 'react';

import { LoginView } from '@/components/views/LoginView';
import { OtpView } from '@/components/views/OtpView';
import { SuccessView } from '@/components/views/SuccessView';
import { VotingView } from '@/components/views/VotingView';
import {
  getCandidates,
  resetSession,
  submitVote,
  verifyOtpCode,
  verifyUserCredentials,
} from '@/lib/api-client';
import type { AppState, Candidate, User } from '@/types';

const VOTING_WINDOW_SECONDS = 120;
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_OTP_ATTEMPTS = 3;
// Idle timeout (#29): reset to login after 5 min without interaction in otp/vote states
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

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
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'back'>('forward');

  function clearLocalSessionState() {
    setAppState('login');
    setOtp('');
    setUser(null);
    setCandidates([]);
    setSelectedCandidateId(null);
    setReceiptCode('');
    setConfirmedCandidateName('');
    setRemainingSeconds(VOTING_WINDOW_SECONDS);
    setLoginAttempts(0);
    setOtpAttempts(0);
  }

  // Idle session expiry (#29) — reset to login after IDLE_TIMEOUT_MS of inactivity
  // Only active during 'otp' and 'vote' states.
  useEffect(() => {
    if (appState !== 'otp' && appState !== 'vote') return undefined;

    let idleTimer: number;

    function resetTimer() {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        setTransitionDirection('back');
        clearLocalSessionState();
        void resetSession();
        setErrorMessage('La sesion expiro por inactividad. Por favor, vuelve a identificarte.');
      }, IDLE_TIMEOUT_MS);
    }

    const events = ['mousemove', 'keydown', 'pointerdown', 'touchstart'] as const;
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(idleTimer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [appState]);

  // Countdown timer — ticks every second while in 'vote' state
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
      setTransitionDirection('forward');
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
        clearLocalSessionState();
        void resetSession();
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
      setTransitionDirection('forward');
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
      setTransitionDirection('forward');
      setAppState('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible registrar el voto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRestart() {
    setTransitionDirection('back');
    setRutNumber('');
    setRutVerifier('');
    setEmail('');
    clearLocalSessionState();
    void resetSession();
    setErrorMessage(null);
  }

  function handleBackToLogin() {
    setTransitionDirection('back');
    clearLocalSessionState();
    void resetSession();
    setErrorMessage(null);
  }

  const STEPS = ['Identificacion', 'Verificacion', 'Papeleta'];
  const stepMap: Record<AppState, number> = { login: 0, otp: 1, vote: 2, success: 3 };
  const currentStep = stepMap[appState];

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
            <div className="relative flex items-center gap-4">
              {/* Escudo institucional */}
              <svg className="shrink-0" width="40" height="46" viewBox="0 0 44 50" fill="none" aria-hidden="true">
                <path d="M22 2L4 10v14c0 12 8.5 22 18 26 9.5-4 18-14 18-26V10L22 2z" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.38)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M22 9L11 14v9c0 7.5 5 13.5 11 16 6-2.5 11-8.5 11-16v-9L22 9z" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeLinejoin="round" />
                <path d="M16 24l4 4 8-8" stroke="rgba(255,255,255,0.72)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="m-0 mb-1 text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-[rgba(200,220,255,0.88)]">
                  Servicio Local de Educacion Publica Colchagua
                </p>
                <h2 className="m-0 font-serif text-[clamp(17px,2.4vw,24px)] text-white leading-tight tracking-tight">
                  Portal de votacion del Consejo Local 
                </h2>
              </div>
            </div>
          </div>

          {/* Step progress */}
          {appState !== 'success' ? (
            <div className="flex items-start mx-1 mb-2.5 mt-1">
              {STEPS.map((label, i) => {
                const done = currentStep > i;
                const active = currentStep === i;
                return (
                  <React.Fragment key={label}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 font-sans font-bold text-[11px] ${
                        done
                          ? 'bg-brand text-white'
                          : active
                          ? 'bg-brand text-white ring-[3px] ring-brand/20'
                          : 'bg-slate-100 text-ink-muted'
                      }`}>
                        {done ? (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (i + 1)}
                      </div>
                      <span className={`text-[9.5px] font-sans font-semibold whitespace-nowrap transition-colors ${
                        done || active ? 'text-brand' : 'text-ink-muted'
                      }`}>{label}</span>
                    </div>
                    {i < STEPS.length - 1 ? (
                      <div className={`flex-1 h-px mt-3 mx-1.5 transition-all duration-500 ${done ? 'bg-brand' : 'bg-slate-200'}`} />
                    ) : null}
                  </React.Fragment>
                );
              })}
            </div>
          ) : null}

          <div key={appState} className={transitionDirection === 'forward' ? 'view-enter-forward' : 'view-enter-back'}>
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
                user={user}
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
                <section className="rounded-2xl bg-white/95 border border-slate-900/10 p-5">
                  <div className="grid gap-4">
                    <div className="flex gap-3 justify-between items-start pb-4 border-b border-slate-900/[0.08]">
                      <div className="grid gap-2.5 min-w-0 flex-1">
                        <div className="skeleton h-2.5 w-24 rounded-full" />
                        <div className="skeleton h-6 w-36 rounded-lg" />
                        <div className="skeleton h-4 w-52 rounded" />
                      </div>
                      <div className="skeleton shrink-0 w-[120px] h-[66px] rounded-2xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="p-3.5 rounded-2xl border border-slate-100 grid gap-2.5">
                          <div className="skeleton w-11 h-11 rounded-full" />
                          <div className="skeleton h-[22px] w-4/5 rounded-md" />
                          <div className="skeleton h-3.5 w-3/5 rounded" />
                          <div className="skeleton h-3 w-full rounded" />
                          <div className="skeleton h-3 w-2/3 rounded" />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <div className="skeleton h-11 w-36 rounded-xl" />
                    </div>
                  </div>
                </section>
              ) : (
                <VotingView
                  candidates={candidates}
                  voterName={user?.fullName ?? 'Participante'}
                  estamento={user!.estamento}
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
        </div>

        <footer className="mt-4 px-4 text-center">
          <p className="m-0 text-[11px] font-sans font-medium uppercase tracking-[0.12em] text-white/78">
            Desarrollado por Servicio Local de Educacion Publica Colchagua - Subdireccion de Gestion Territorial
          </p>
        </footer>
      </section>
    </main>
  );
}
'use client';

import { useEffect, useState } from 'react';

import { LoginView } from '@/components/views/LoginView';
import { OtpView } from '@/components/views/OtpView';
import { SuccessView } from '@/components/views/SuccessView';
import { VotingView } from '@/components/views/VotingView';
import {
  demoCredentials,
  getCandidates,
  submitVote,
  verifyOtpCode,
  verifyUserCredentials,
} from '@/lib/mock-api';
import type { AppState, Candidate, User } from '@/types';

const VOTING_WINDOW_SECONDS = 120;

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);

  useEffect(() => {
    async function loadCandidates() {
      try {
        const availableCandidates = await getCandidates();
        setCandidates(availableCandidates);
      } catch {
        setErrorMessage('No fue posible cargar la papeleta en este momento.');
      } finally {
        setIsLoadingCandidates(false);
      }
    }

    void loadCandidates();
  }, []);

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
  const rut = rutNumber && rutVerifier ? `${rutNumber}-${rutVerifier}` : rutNumber;

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await verifyUserCredentials(rut, email);
      setUser(authenticatedUser);
      setAppState('otp');
      setOtp('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible validar la identidad.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await verifyOtpCode(otp);
      setOtp(''); // clear OTP from memory after successful verification
      setRemainingSeconds(VOTING_WINDOW_SECONDS);
      setSelectedCandidateId(null);
      setAppState('vote');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible validar el OTP.');
    } finally {
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

  // TODO(backend-integration): remove demo pre-fill — reset to empty strings in production
  function handleRestart() {
    const [demoRutNum, demoRutVerif = ''] = demoCredentials.rut.split('-');
    setAppState('login');
    setRutNumber(demoRutNum);
    setRutVerifier(demoRutVerif);
    setEmail(demoCredentials.email);
    setOtp('');
    setUser(null);
    setSelectedCandidateId(null);
    setReceiptCode('');
    setConfirmedCandidateName('');
    setRemainingSeconds(VOTING_WINDOW_SECONDS);
    setErrorMessage(null);
  }

  function handleBackToLogin() {
    setAppState('login');
    setOtp('');
    setErrorMessage(null);
  }

  return (
    <main className="shell">
      <div className="shell__backdrop" />
      <section className="shell__content">
        <section className="stage-card">
          <div className="stage-card__intro">
            <p className="stage-card__eyebrow">Servicio Local de Educacion Publica</p>
            <h2 className="stage-card__title">Portal de votacion del Consejo Local</h2>
            {/* TODO(backend-integration): replace description with production copy, remove 'datos simulados' reference */}
            <p className="stage-card__description">
              Una interfaz limpia para validar el flujo de acceso, autenticacion por OTP y emision de voto con datos simulados.
            </p>
          </div>

          {appState === 'login' ? (
            <LoginView
              rutNumber={rutNumber}
              rutVerifier={rutVerifier}
              email={email}
              isSubmitting={isSubmitting}
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
              errorMessage={errorMessage}
              onOtpChange={setOtp}
              onBack={handleBackToLogin}
              onSubmit={handleOtpSubmit}
            />
          ) : null}

          {appState === 'vote' ? (
            isLoadingCandidates ? (
              <section className="panel panel--loading">
                <p className="panel__eyebrow">Cargando papeleta</p>
                <h1 className="panel__title">Preparando candidaturas</h1>
                <p className="panel__description">
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
        </section>
      </section>
    </main>
  );
}
import type { Candidate } from '@/types';

interface VotingViewProps {
  candidates: Candidate[];
  voterName: string;
  selectedCandidateId: string | null;
  remainingSeconds: number;
  hasExpired: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSelectCandidate: (candidateId: string) => void;
  onSubmitVote: () => void;
}

function formatTimer(totalSeconds: number) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function VotingView({
  candidates,
  voterName,
  selectedCandidateId,
  remainingSeconds,
  hasExpired,
  isSubmitting,
  errorMessage,
  onSelectCandidate,
  onSubmitVote,
}: VotingViewProps) {
  return (
    <section className="panel panel--wide">
      <div className="panel__header panel__header--split">
        <div>
          <p className="panel__eyebrow">Papeleta digital</p>
          <h1 className="panel__title">Emision de voto</h1>
          <p className="panel__description">
            {voterName}, selecciona una candidatura y confirma tu voto antes de que expire la sesion.
          </p>
        </div>

        <div className={`timer ${hasExpired ? 'timer--expired' : ''}`}>
          <span className="timer__label">Tiempo restante</span>
          <strong className="timer__value">{formatTimer(remainingSeconds)}</strong>
        </div>
      </div>

      <div className="candidate-grid">
        {candidates.map((candidate) => {
          const isSelected = selectedCandidateId === candidate.id;

          return (
            <button
              key={candidate.id}
              type="button"
              className={`candidate-card ${isSelected ? 'candidate-card--selected' : ''}`}
              onClick={() => onSelectCandidate(candidate.id)}
              aria-pressed={isSelected}
              disabled={hasExpired || isSubmitting}
              style={{ ['--candidate-accent' as string]: candidate.accentColor }}
            >
              <span className="candidate-card__badge">{candidate.initials}</span>
              <span className="candidate-card__name">{candidate.name}</span>
            </button>
          );
        })}
      </div>

      {errorMessage ? <p className="form-message form-message--error">{errorMessage}</p> : null}
      {hasExpired ? (
        <p className="form-message form-message--warning">
          El tiempo de la sesion termino. Debes reiniciar el flujo para emitir tu voto.
        </p>
      ) : null}

      <div className="button-row button-row--end">
        <button
          className="button button--primary"
          type="button"
          onClick={onSubmitVote}
          disabled={hasExpired || isSubmitting || !selectedCandidateId}
          style={{ width: 'auto', minWidth: 180 }}
        >
          {isSubmitting ? 'Registrando…' : 'Confirmar voto →'}
        </button>
      </div>
    </section>
  );
}
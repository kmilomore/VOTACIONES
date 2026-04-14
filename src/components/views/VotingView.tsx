'use client';

import React, { useState } from 'react';

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) ?? null;

  function handleConfirmClick() {
    if (!selectedCandidateId || hasExpired) return;
    setShowConfirmModal(true);
  }

  return (
    <>
    <section className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-900/10 text-ink p-5">
      {/* Header row: title + timer */}
      <div className="flex gap-3 justify-between items-start mb-4 pb-4 border-b border-slate-900/[0.08]">
        <div className="min-w-0">
          <p className="m-0 mb-1.5 text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-ink-muted">
            Papeleta digital
          </p>
          <h1 className="m-0 font-serif text-[clamp(20px,2.6vw,28px)] text-ink leading-none tracking-tight">
            Emision de voto
          </h1>
          <p className="mt-2 mb-0 text-sm text-ink-muted font-sans leading-relaxed">
            {voterName}, selecciona una candidatura y confirma tu voto antes de que expire la sesion.
          </p>
        </div>

        {/* Timer */}
        <div className={`shrink-0 min-w-[120px] px-3 py-2.5 rounded-2xl border text-center font-sans shadow-sm transition-all duration-300 ${
          hasExpired || remainingSeconds <= 10
            ? 'border-red-200 text-red-600 bg-red-50'
            : remainingSeconds <= 30
            ? 'border-amber-200 text-amber-700 bg-amber-50'
            : 'border-slate-900/10 text-ink bg-white'
        }`}>
          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">Tiempo</span>
          <strong className="block mt-1 text-xl tabular-nums">{formatTimer(remainingSeconds)}</strong>
        </div>
      </div>

      {/* Candidate grid */}
      <div className="grid grid-cols-2 gap-3">
        {candidates.map((candidate) => {
          const isSelected = selectedCandidateId === candidate.id;
          return (
            <button
              key={candidate.id}
              type="button"
              className={`grid gap-2 p-3.5 text-left rounded-2xl border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                isSelected
                  ? 'candidate-selected bg-gradient-to-b from-white to-slate-50/80'
                  : 'border-slate-900/[0.1] bg-gradient-to-b from-white to-slate-50/80 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-900/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={() => onSelectCandidate(candidate.id)}
              aria-pressed={isSelected}
              disabled={hasExpired || isSubmitting}
              style={{ ['--accent' as string]: candidate.accentColor }}
            >
              <span className="candidate-badge inline-grid place-items-center w-11 h-11 rounded-full text-[15px]">
                {candidate.initials}
              </span>
              <span className="text-[17px] font-bold text-ink font-serif leading-tight">
                {candidate.name}
              </span>
              <span className="text-[11px] font-sans font-medium text-ink-muted leading-tight">
                {candidate.role}
              </span>
              <span className="text-[11px] font-sans italic text-ink-muted/70 leading-snug line-clamp-2">
                &ldquo;{candidate.slogan}&rdquo;
              </span>
            </button>
          );
        })}
      </div>

      {errorMessage ? (
        <p className="m-0 mt-3 px-3.5 py-2.5 rounded-xl text-[13px] font-sans font-medium text-red-600 bg-red-50 border border-red-200">
          {errorMessage}
        </p>
      ) : null}

      {hasExpired ? (
        <p className="m-0 mt-3 px-3.5 py-2.5 rounded-xl text-[13px] font-sans font-medium text-amber-700 bg-amber-50 border border-amber-200">
          El tiempo de la sesion termino. Debes reiniciar el flujo para emitir tu voto.
        </p>
      ) : null}

      <div className="flex justify-end mt-3">
        <button
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-brand text-white font-sans text-sm font-bold tracking-wide shadow-[0_4px_14px_rgba(11,66,120,0.36),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-brand-mid hover:-translate-y-px active:translate-y-0 disabled:opacity-45 disabled:cursor-not-allowed transition-all duration-150"
          type="button"
          onClick={handleConfirmClick}
          disabled={hasExpired || isSubmitting || !selectedCandidateId}
        >
          {isSubmitting ? <><span className="btn-spinner mr-2" />Registrando…</> : 'Confirmar voto →'}
        </button>
      </div>
    </section>
      {showConfirmModal && selectedCandidate ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmModal(false); }}
        >
          <div className="modal-panel">
            <div className="p-5 border-b border-slate-900/[0.08]">
              <h2 id="modal-title" className="m-0 font-serif text-[20px] text-ink leading-tight tracking-tight">
                Confirma tu voto
              </h2>
              <p className="mt-1.5 mb-0 text-sm text-ink-muted font-sans">
                Esta accion no se puede deshacer.
              </p>
            </div>
            <div className="p-5 grid gap-4">
              <div
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-900/[0.08]"
                style={{ ['--accent' as string]: selectedCandidate.accentColor }}
              >
                <span className="candidate-badge inline-grid place-items-center w-11 h-11 rounded-full text-[15px] shrink-0">
                  {selectedCandidate.initials}
                </span>
                <div className="min-w-0">
                  <p className="m-0 font-serif font-bold text-[16px] text-ink leading-tight">{selectedCandidate.name}</p>
                  <p className="m-0 mt-0.5 font-sans text-[11px] text-ink-muted leading-tight">{selectedCandidate.role}</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  className="flex-1 inline-flex items-center justify-center h-11 px-4 rounded-xl bg-white text-ink-mid font-sans text-sm font-bold border-[1.5px] border-slate-900/[0.14] hover:bg-slate-50 transition-all duration-150 disabled:opacity-45"
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 inline-flex items-center justify-center h-11 px-5 rounded-xl bg-brand text-white font-sans text-sm font-bold tracking-wide shadow-[0_4px_14px_rgba(11,66,120,0.36)] hover:bg-brand-mid transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed"
                  type="button"
                  onClick={() => { setShowConfirmModal(false); onSubmitVote(); }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <><span className="btn-spinner mr-2" />Registrando…</> : 'Emitir voto →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>  );
}
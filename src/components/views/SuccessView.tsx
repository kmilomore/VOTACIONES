interface SuccessViewProps {
  voterName: string;
  candidateName: string;
  receiptCode: string;
  onRestart: () => void;
}

export function SuccessView({ voterName, candidateName, receiptCode, onRestart }: SuccessViewProps) {
  return (
    <section className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-900/10 text-ink p-6">
      <div className="grid gap-4 justify-items-center text-center">

        {/* Animated check icon */}
        <div className="check-circle w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              className="check-path"
              d="M7 16l6 6 12-12"
              stroke="#059669"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="grid gap-1.5">
          <h1 className="m-0 font-serif text-[clamp(22px,3vw,30px)] text-ink leading-none tracking-tight">
            ¡Voto registrado!
          </h1>
          <p className="m-0 text-sm text-ink-muted font-sans leading-relaxed">
            {voterName}, tu preferencia fue registrada correctamente.
          </p>
        </div>

        <div className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
          <span className="block text-[10px] font-bold font-sans uppercase tracking-[0.14em] text-ink-muted mb-1">
            Candidatura elegida
          </span>
          <strong className="block text-[17px] font-serif text-ink">{candidateName}</strong>
        </div>

        <div className="w-full px-4 py-3.5 rounded-2xl border border-slate-900/10 bg-white shadow-sm text-left">
          <span className="block text-[10px] font-bold font-sans uppercase tracking-[0.14em] text-ink-muted mb-1.5">
            Codigo de comprobante
          </span>
          <code className="block text-[12px] font-mono text-ink tracking-wider break-all">{receiptCode}</code>
        </div>

        <p className="m-0 w-full px-3.5 py-2.5 rounded-xl text-[12px] font-sans text-emerald-700 bg-emerald-50 border border-emerald-200 text-left">
          Entorno de prueba — datos simulados del portal institucional.
        </p>

        <button
          className="inline-flex items-center justify-center w-full h-11 px-5 rounded-xl bg-brand text-white font-sans text-sm font-bold tracking-wide shadow-[0_4px_14px_rgba(11,66,120,0.36),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-brand-mid hover:-translate-y-px active:translate-y-0 transition-all duration-150"
          type="button"
          onClick={onRestart}
        >
          Reiniciar demo
        </button>
      </div>
    </section>
  );
}
interface SuccessViewProps {
  voterName: string;
  candidateName: string;
  receiptCode: string;
  onRestart: () => void;
}

export function SuccessView({ voterName, candidateName, receiptCode, onRestart }: SuccessViewProps) {
  return (
    <section className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-900/10 text-ink p-5">
      <div className="grid gap-3 justify-items-start">
        <h1 className="m-0 font-serif text-[clamp(20px,2.6vw,28px)] text-ink leading-none tracking-tight">
          Gracias por participar
        </h1>
        <p className="m-0 text-sm text-ink-muted font-sans leading-relaxed">
          {voterName}, tu preferencia por <strong className="text-ink">{candidateName}</strong> fue registrada correctamente en el entorno de prueba.
        </p>

        <div className="w-full px-4 py-3 rounded-2xl border border-slate-900/10 bg-white shadow-sm">
          <span className="block text-[10px] font-bold font-sans uppercase tracking-[0.14em] text-ink-muted">Comprobante simulado</span>
          <strong className="block mt-1.5 text-lg font-sans text-ink tracking-wider">{receiptCode}</strong>
        </div>

        <p className="m-0 px-3.5 py-2.5 rounded-xl text-[13px] font-sans font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
          Esta confirmacion representa la fase de frontend con datos simulados del portal institucional.
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
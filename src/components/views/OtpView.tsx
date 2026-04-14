interface OtpViewProps {
  email: string;
  otp: string;
  isSubmitting: boolean;
  isLocked: boolean;
  errorMessage: string | null;
  onOtpChange: (value: string) => void;
  onBack: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function OtpView({
  email,
  otp,
  isSubmitting,
  isLocked,
  errorMessage,
  onOtpChange,
  onBack,
  onSubmit,
}: OtpViewProps) {
  return (
    <section className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-900/10 text-ink p-5">
      <div className="mb-4 pb-4 border-b border-slate-900/[0.08]">
        <h1 className="mt-0 mb-0 font-serif text-[clamp(20px,2.6vw,28px)] text-ink leading-none tracking-tight">
          Codigo de acceso
        </h1>
        <p className="mt-2 mb-0 text-sm text-ink-muted font-sans leading-relaxed">
          Enviamos un codigo de 6 digitos a <strong>{email}</strong>. Ingrésalo a continuacion.
        </p>

      </div>

      <form className="grid gap-3.5" onSubmit={onSubmit}>
        <label className="grid gap-2">
          <span className="text-[11px] font-bold font-sans text-ink-mid uppercase tracking-wide">Codigo de 6 digitos</span>
          <input
            className="otp-input w-full h-12 px-3.5 rounded-xl border-[1.5px] border-slate-900/[0.14] bg-white text-ink font-sans transition-all duration-150 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 placeholder:text-ink-muted/50"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
            required
          />
        </label>

        {errorMessage ? (
          <p className="m-0 px-3.5 py-2.5 rounded-xl text-[13px] font-sans font-medium text-red-600 bg-red-50 border border-red-200">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex gap-2.5">
          <button
            className="inline-flex items-center justify-center h-11 px-4 rounded-xl bg-white text-ink-mid font-sans text-sm font-bold border-[1.5px] border-slate-900/[0.14] shadow-sm hover:bg-slate-50 hover:-translate-y-px active:translate-y-0 disabled:opacity-45 disabled:cursor-not-allowed transition-all duration-150"
            type="button"
            onClick={onBack}
            disabled={isSubmitting || isLocked}
          >
            ← Volver
          </button>
          <button
            className="flex-1 inline-flex items-center justify-center h-11 px-5 rounded-xl bg-brand text-white font-sans text-sm font-bold tracking-wide shadow-[0_4px_14px_rgba(11,66,120,0.36),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-brand-mid hover:-translate-y-px active:translate-y-0 disabled:opacity-45 disabled:cursor-not-allowed transition-all duration-150"
            type="submit"
            disabled={isSubmitting || isLocked}
          >
            {isSubmitting ? <><span className="btn-spinner mr-2" />Verificando…</> : 'Acceder a la papeleta →'}
          </button>
        </div>
      </form>
    </section>
  );
}
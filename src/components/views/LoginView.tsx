function validateRut(number: string, verifier: string): 'valid' | 'invalid' | 'empty' {
  if (!number || !verifier) return 'empty';
  const digits = number.split('').reverse().map(Number);
  const multipliers = [2, 3, 4, 5, 6, 7];
  const sum = digits.reduce((acc, d, i) => acc + d * multipliers[i % multipliers.length], 0);
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return verifier.toUpperCase() === expected ? 'valid' : 'invalid';
}

function formatRutNumber(raw: string): string {
  if (raw.length <= 3) return raw;
  const rev = raw.split('').reverse();
  const groups: string[] = [];
  for (let i = 0; i < rev.length; i += 3) {
    groups.push(rev.slice(i, i + 3).join(''));
  }
  return groups.join('.').split('').reverse().join('');
}

const inputClass =
  'w-full h-11 px-3.5 rounded-xl border-[1.5px] border-slate-900/[0.14] bg-white text-ink font-sans text-[15px] transition-all duration-150 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 placeholder:text-ink-muted/50';

const labelClass = 'text-[11px] font-bold font-sans text-ink-mid uppercase tracking-wide';

interface LoginViewProps {
  rutNumber: string;
  rutVerifier: string;
  email: string;
  isSubmitting: boolean;
  isLocked: boolean;
  errorMessage: string | null;
  onRutNumberChange: (value: string) => void;
  onRutVerifierChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function LoginView({
  rutNumber,
  rutVerifier,
  email,
  isSubmitting,
  isLocked,
  errorMessage,
  onRutNumberChange,
  onRutVerifierChange,
  onEmailChange,
  onSubmit,
}: LoginViewProps) {
  const rutStatus = validateRut(rutNumber, rutVerifier);

  return (
    <section className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-900/10 text-ink p-5">
      <div className="mb-4 pb-4 border-b border-slate-900/[0.08]">
        <h1 className="mt-0 mb-0 font-serif text-[clamp(20px,2.6vw,28px)] text-ink leading-none tracking-tight">
          Ingresa para votar
        </h1>
        <p className="mt-2 mb-0 text-sm text-ink-muted font-sans leading-relaxed">
          Ingresa tu RUT y correo institucional registrado en el padron del Consejo Local.
        </p>

      </div>

      <form className="grid gap-3.5" onSubmit={onSubmit}>
        <div className="grid gap-2">
          <span className={labelClass}>RUT</span>
          <div className="grid grid-cols-[1fr_auto_88px] gap-2 items-center">
            <input
              className={inputClass}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              placeholder="12345678"
              value={rutNumber}
              onChange={(event) => {
                // Allowlist: only ASCII digits 0-9, max 8 chars
                const sanitized = event.target.value.replace(/[^0-9]/g, '').slice(0, 8);
                onRutNumberChange(sanitized);
              }}
              required
            />
            <span className="text-[#36506c] text-xl font-bold select-none">–</span>
            <input
              className={`${inputClass} text-center uppercase`}
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="9"
              value={rutVerifier}
              onChange={(event) => {
                // Allowlist: only digits 0-9 or letter K/k, single char
                const sanitized = event.target.value.replace(/[^0-9kK]/g, '').slice(0, 1).toUpperCase();
                onRutVerifierChange(sanitized);
              }}
              required
            />
          </div>
          {rutStatus !== 'empty' ? (
            <p className={`m-0 flex items-center gap-1.5 text-[12px] font-sans font-medium ${rutStatus === 'valid' ? 'text-emerald-600' : 'text-red-500'}`}>
              {rutStatus === 'valid' ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M3.5 6.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {formatRutNumber(rutNumber)}-{rutVerifier.toUpperCase()} — RUT v&#225;lido
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  D&#237;gito verificador incorrecto
                </>
              )}
            </p>
          ) : null}
        </div>

        <label className="grid gap-2">
          <span className={labelClass}>Correo electronico</span>
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="usuario@slep.cl"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
          />
        </label>

        {errorMessage ? (
          <p className="m-0 px-3.5 py-2.5 rounded-xl text-[13px] font-sans font-medium text-red-600 bg-red-50 border border-red-200">
            {errorMessage}
          </p>
        ) : null}

        <button
          className="inline-flex items-center justify-center w-full h-11 px-5 rounded-xl bg-brand text-white font-sans text-sm font-bold tracking-wide shadow-[0_4px_14px_rgba(11,66,120,0.36),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-brand-mid hover:shadow-[0_6px_20px_rgba(11,66,120,0.44)] hover:-translate-y-px active:translate-y-0 disabled:opacity-45 disabled:cursor-not-allowed transition-all duration-150"
          type="submit"
          disabled={isSubmitting || isLocked}
        >
          {isSubmitting ? <><span className="btn-spinner mr-2" />Validando…</> : 'Continuar →'}
        </button>
      </form>
    </section>
  );
}
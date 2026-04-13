interface LoginViewProps {
  rutNumber: string;
  rutVerifier: string;
  email: string;
  isSubmitting: boolean;
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
  errorMessage,
  onRutNumberChange,
  onRutVerifierChange,
  onEmailChange,
  onSubmit,
}: LoginViewProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <span className="step-chip">Paso 1 de 3 &mdash; Identificacion</span>
        <h1 className="panel__title">Ingresa para votar</h1>
        <p className="panel__description">
          Ingresa tu RUT y correo institucional registrado en el padron del Consejo Local.
        </p>
        {/* TODO(backend-integration): remove demo hint before production */}
        <p className="panel__hint">Demo: 12345678 &ndash; 9 &nbsp;|&nbsp; usuario@slep.cl</p>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <div className="field">
          <span className="field__label">RUT</span>
          <div className="rut-group">
            <input
              className="field__input rut-group__number"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="12345678"
              value={rutNumber}
              onChange={(event) => onRutNumberChange(event.target.value.replace(/\D/g, '').slice(0, 8))}
              required
            />
            <span className="rut-group__separator">-</span>
            <input
              className="field__input rut-group__verifier"
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="9"
              value={rutVerifier}
              onChange={(event) => onRutVerifierChange(event.target.value.replace(/[^0-9kK]/g, '').slice(0, 1).toUpperCase())}
              required
            />
          </div>
        </div>

        <label className="field">
          <span className="field__label">Correo electronico</span>
          <input
            className="field__input"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="usuario@slep.cl"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
          />
        </label>

        {errorMessage ? <p className="form-message form-message--error">{errorMessage}</p> : null}

        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Validando…' : 'Continuar →'}
        </button>
      </form>
    </section>
  );
}
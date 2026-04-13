interface OtpViewProps {
  email: string;
  otp: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onOtpChange: (value: string) => void;
  onBack: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function OtpView({
  email,
  otp,
  isSubmitting,
  errorMessage,
  onOtpChange,
  onBack,
  onSubmit,
}: OtpViewProps) {
  return (
    <section className="panel">
      <div className="panel__header">
        <span className="step-chip">Paso 2 de 3 &mdash; Verificacion</span>
        <h1 className="panel__title">Codigo de acceso</h1>
        <p className="panel__description">
          Enviamos un codigo de 6 digitos a <strong>{email}</strong>. Ingrésalo a continuacion.
        </p>
        {/* TODO(backend-integration): remove demo hint before production */}
        <p className="panel__hint">Demo: codigo es 123456</p>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <label className="field">
          <span className="field__label">Codigo de 6 digitos</span>
          <input
            className="field__input field__input--otp"
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

        {errorMessage ? <p className="form-message form-message--error">{errorMessage}</p> : null}

        <div className="button-row">
          <button className="button button--secondary" type="button" onClick={onBack} disabled={isSubmitting}>
            &larr; Volver
          </button>
          <button className="button button--primary" type="submit" disabled={isSubmitting} style={{flex: 1}}>
            {isSubmitting ? 'Verificando…' : 'Acceder a la papeleta →'}
          </button>
        </div>
      </form>
    </section>
  );
}
interface SuccessViewProps {
  voterName: string;
  candidateName: string;
  receiptCode: string;
  onRestart: () => void;
}

export function SuccessView({ voterName, candidateName, receiptCode, onRestart }: SuccessViewProps) {
  return (
    <section className="panel success-panel">
      <h1 className="panel__title">Gracias por participar</h1>
      <p className="panel__description">
        {voterName}, tu preferencia por {candidateName} fue registrada correctamente en el entorno de prueba.
      </p>

      <div className="receipt-card">
        <span className="receipt-card__label">Comprobante simulado</span>
        <strong className="receipt-card__value">{receiptCode}</strong>
      </div>

      <p className="form-message form-message--success">
        Esta confirmacion representa la fase de frontend con datos simulados del portal institucional.
      </p>

      <button className="button button--primary" type="button" onClick={onRestart}>
        Reiniciar demo
      </button>
    </section>
  );
}
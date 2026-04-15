interface IntroViewProps {
  isDemoMode: boolean;
  isHighContrast: boolean;
  isPrivacyMode: boolean;
  isSimplifiedMode: boolean;
  onDemoModeChange: (enabled: boolean) => void;
  onHighContrastChange: (enabled: boolean) => void;
  onPrivacyModeChange: (enabled: boolean) => void;
  onSimplifiedModeChange: (enabled: boolean) => void;
  onStart: () => void;
}

const toggleLabelClass =
  'text-[11px] font-bold font-sans text-[#1c3d5c] uppercase tracking-wide';

export function IntroView({
  isDemoMode,
  isHighContrast,
  isPrivacyMode,
  isSimplifiedMode,
  onDemoModeChange,
  onHighContrastChange,
  onPrivacyModeChange,
  onSimplifiedModeChange,
  onStart,
}: IntroViewProps) {
  return (
    <section className="rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-900/10 text-[#0c2138] p-5">
      <div className="mb-4 pb-4 border-b border-slate-900/[0.08]">
        <p className="m-0 text-[10px] font-bold font-sans uppercase tracking-[0.16em] text-[#4e6a85]">
          Orientacion previa
        </p>
        <h1 className="mt-1 mb-0 font-serif text-[clamp(21px,2.7vw,29px)] text-[#0c2138] leading-none tracking-tight">
          Antes de comenzar
        </h1>
        <p className="mt-2 mb-0 text-sm text-slate-500 font-sans leading-relaxed">
          Este portal te guiara paso a paso. Antes de iniciar, verifica que tienes a mano lo necesario para completar la identificacion y revisar la papeleta sin interrupciones.
        </p>
      </div>

      <div className="grid gap-3.5">
        <div className="rounded-2xl border border-slate-900/[0.08] bg-slate-50 px-4 py-3.5">
          <p className="m-0 text-[11px] font-bold font-sans uppercase tracking-[0.14em] text-[#1c3d5c]">
            Que necesitaras
          </p>
          <ul className="mt-2 mb-0 pl-5 text-[13px] text-[#36506c] font-sans leading-6">
            <li>RUT sin puntos y con digito verificador.</li>
            <li>Correo institucional registrado en el padron.</li>
            <li>Acceso al codigo OTP de 6 digitos.</li>
            <li>Unos 2 minutos continuos para revisar y confirmar la candidatura.</li>
          </ul>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 rounded-2xl border border-slate-900/[0.08] bg-white px-4 py-3.5 cursor-pointer">
            <span className={toggleLabelClass}>Modo de simulacion</span>
            <span className="text-[13px] font-sans leading-relaxed text-[#4e6a85]">
              Recorre el flujo como capacitacion. La UI remarca que estas en un entorno de demostracion y evita ambiguedades con una jornada real.
            </span>
            <span className="mt-1 inline-flex items-center gap-2 text-[13px] font-sans font-medium text-[#0c2138]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#0b5294] focus:ring-[#0b5294]"
                checked={isDemoMode}
                onChange={(event) => onDemoModeChange(event.target.checked)}
              />
              Activar simulacion guiada
            </span>
          </label>

          <label className="grid gap-2 rounded-2xl border border-slate-900/[0.08] bg-white px-4 py-3.5 cursor-pointer">
            <span className={toggleLabelClass}>Legibilidad</span>
            <span className="text-[13px] font-sans leading-relaxed text-[#4e6a85]">
              Activa un contraste mas fuerte para jornadas presenciales, pantallas con brillo irregular o usuarios que prefieren bordes y textos mas marcados.
            </span>
            <span className="mt-1 inline-flex items-center gap-2 text-[13px] font-sans font-medium text-[#0c2138]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#0b5294] focus:ring-[#0b5294]"
                checked={isHighContrast}
                onChange={(event) => onHighContrastChange(event.target.checked)}
              />
              Activar contraste alto institucional
            </span>
          </label>

          <label className="grid gap-2 rounded-2xl border border-slate-900/[0.08] bg-white px-4 py-3.5 cursor-pointer">
            <span className={toggleLabelClass}>Privacy mode</span>
            <span className="text-[13px] font-sans leading-relaxed text-[#4e6a85]">
              Oculta nombres visibles en pantallas compartidas y reduce la exposición de datos mientras el votante completa el flujo.
            </span>
            <span className="mt-1 inline-flex items-center gap-2 text-[13px] font-sans font-medium text-[#0c2138]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#0b5294] focus:ring-[#0b5294]"
                checked={isPrivacyMode}
                onChange={(event) => onPrivacyModeChange(event.target.checked)}
              />
              Ocultar datos visibles
            </span>
          </label>

          <label className="grid gap-2 rounded-2xl border border-slate-900/[0.08] bg-white px-4 py-3.5 cursor-pointer">
            <span className={toggleLabelClass}>Lectura simplificada</span>
            <span className="text-[13px] font-sans leading-relaxed text-[#4e6a85]">
              Usa textos más directos y una lectura más calmada para usuarios nerviosos o con baja alfabetización digital.
            </span>
            <span className="mt-1 inline-flex items-center gap-2 text-[13px] font-sans font-medium text-[#0c2138]">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-[#0b5294] focus:ring-[#0b5294]"
                checked={isSimplifiedMode}
                onChange={(event) => onSimplifiedModeChange(event.target.checked)}
              />
              Activar lectura simplificada
            </span>
          </label>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <p className="m-0 text-[11px] font-bold font-sans uppercase tracking-[0.14em] text-amber-800">
            Soporte durante la jornada
          </p>
          <p className="mt-1.5 mb-0 text-[13px] font-sans leading-relaxed text-amber-900/85">
            Si tienes problemas de acceso, usa la mesa de apoyo definida por tu establecimiento o contacta al soporte local de la jornada. El canal debe estar visible junto al puesto de votacion.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center w-full h-11 px-5 rounded-xl bg-[#0b5294] text-white font-sans text-sm font-bold tracking-wide shadow-[0_4px_14px_rgba(11,82,148,0.40),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-[#0a4278] hover:shadow-[0_6px_20px_rgba(11,82,148,0.48)] hover:-translate-y-px active:translate-y-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0b5294]/20"
          type="button"
          onClick={onStart}
        >
          {isDemoMode ? 'Iniciar simulacion guiada →' : 'Iniciar identificacion →'}
        </button>
      </div>
    </section>
  );
}
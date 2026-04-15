import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { IntroView } from '@/components/views/IntroView';

function renderIntro(overrides: Partial<React.ComponentProps<typeof IntroView>> = {}) {
  const props: React.ComponentProps<typeof IntroView> = {
    isDemoMode: false,
    isHighContrast: false,
    isPrivacyMode: false,
    isSimplifiedMode: false,
    onDemoModeChange: vi.fn(),
    onHighContrastChange: vi.fn(),
    onPrivacyModeChange: vi.fn(),
    onSimplifiedModeChange: vi.fn(),
    onStart: vi.fn(),
    ...overrides,
  };

  return { ...render(<IntroView {...props} />), props };
}

describe('IntroView', () => {
  it('muestra la orientacion previa y la lista de requisitos', () => {
    renderIntro();
    expect(screen.getByText(/antes de comenzar/i)).toBeInTheDocument();
    expect(screen.getByText(/RUT sin puntos/i)).toBeInTheDocument();
  });

  it('permite activar la simulacion guiada', async () => {
    const onDemoModeChange = vi.fn();
    renderIntro({ onDemoModeChange });
    await userEvent.click(screen.getByLabelText(/activar simulacion guiada/i));
    expect(onDemoModeChange).toHaveBeenCalledWith(true);
  });

  it('permite activar privacy mode', async () => {
    const onPrivacyModeChange = vi.fn();
    renderIntro({ onPrivacyModeChange });
    await userEvent.click(screen.getByLabelText(/ocultar datos visibles/i));
    expect(onPrivacyModeChange).toHaveBeenCalledWith(true);
  });

  it('llama a onStart al iniciar el flujo', async () => {
    const onStart = vi.fn();
    renderIntro({ onStart });
    await userEvent.click(screen.getByRole('button', { name: /iniciar identificacion/i }));
    expect(onStart).toHaveBeenCalledOnce();
  });
});
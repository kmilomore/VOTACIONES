import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SuccessView } from '@/components/views/SuccessView';

function renderSuccess(overrides: Partial<React.ComponentProps<typeof SuccessView>> = {}) {
  const props: React.ComponentProps<typeof SuccessView> = {
    voterName: 'Test Votante',
    candidateName: 'Ana Pérez',
    receiptCode: 'SLEP-AP-A1B2C3D4',
    isDemoMode: false,
    onRestart: vi.fn(),
    ...overrides,
  };
  return { ...render(<SuccessView {...props} />), props };
}

describe('SuccessView', () => {
  it('muestra el nombre del votante', () => {
    renderSuccess();
    expect(screen.getByText(/Test,/i)).toBeInTheDocument();
  });

  it('muestra el nombre del candidato elegido', () => {
    renderSuccess();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
  });

  it('muestra el código de comprobante', () => {
    renderSuccess();
    expect(screen.getByText('SLEP-AP-A1B2C3D4')).toBeInTheDocument();
  });

  it('llama a onRestart al pulsar el botón de reinicio', async () => {
    const onRestart = vi.fn();
    renderSuccess({ onRestart });
    await userEvent.click(screen.getByRole('button', { name: /reiniciar/i }));
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('muestra el mensaje de simulacion cuando isDemoMode es true', () => {
    renderSuccess({ isDemoMode: true });
    expect(screen.getByText(/solo para capacitacion/i)).toBeInTheDocument();
  });
});

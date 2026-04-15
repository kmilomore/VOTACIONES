import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OtpView } from '@/components/views/OtpView';

function renderOtp(overrides: Partial<React.ComponentProps<typeof OtpView>> = {}) {
  const props: React.ComponentProps<typeof OtpView> = {
    email: 'usuario@slep.cl',
    otp: '',
    isSubmitting: false,
    isLocked: false,
    errorMessage: null,
    onOtpChange: vi.fn(),
    onBack: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    ...overrides,
  };
  return { ...render(<OtpView {...props} />), props };
}

describe('OtpView', () => {
  it('muestra el email enmascarado en el texto de instrucciones', () => {
    renderOtp({ email: 'usuario@slep.cl' });
    expect(screen.getByText(/usuario@slep\.cl/i)).toBeInTheDocument();
  });

  it('renderiza el input de OTP con maxLength 6', () => {
    renderOtp();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
    inputs.forEach((input) => expect(input).toHaveAttribute('maxLength', '2'));
  });

  it('muestra los botones Volver y Acceder', () => {
    renderOtp();
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder/i })).toBeInTheDocument();
  });

  it('deshabilita ambos botones cuando isSubmitting es true', () => {
    renderOtp({ isSubmitting: true });
    screen.getAllByRole('button').forEach((btn) => expect(btn).toBeDisabled());
  });

  it('deshabilita ambos botones cuando isLocked es true', () => {
    renderOtp({ isLocked: true });
    screen.getAllByRole('button').forEach((btn) => expect(btn).toBeDisabled());
  });

  it('muestra mensaje de error cuando errorMessage tiene valor', () => {
    renderOtp({ errorMessage: 'El código OTP no es válido o ha expirado.' });
    expect(screen.getByText(/otp no es válido/i)).toBeInTheDocument();
  });

  it('llama a onBack al pulsar el botón Volver', async () => {
    const onBack = vi.fn();
    renderOtp({ onBack });
    await userEvent.click(screen.getByRole('button', { name: /volver/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('no muestra el chip de demo en la UI', () => {
    renderOtp();
    expect(screen.queryByText(/demo:/i)).not.toBeInTheDocument();
  });
});

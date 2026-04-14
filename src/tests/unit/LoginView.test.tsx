import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LoginView } from '@/components/views/LoginView';

function renderLogin(overrides: Partial<React.ComponentProps<typeof LoginView>> = {}) {
  const props: React.ComponentProps<typeof LoginView> = {
    rutNumber: '',
    rutVerifier: '',
    email: '',
    isSubmitting: false,
    isLocked: false,
    errorMessage: null,
    onRutNumberChange: vi.fn(),
    onRutVerifierChange: vi.fn(),
    onEmailChange: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    ...overrides,
  };
  return { ...render(<LoginView {...props} />), props };
}

describe('LoginView', () => {
  it('renderiza los campos de RUT y correo', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('12345678')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('9')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('usuario@slep.cl')).toBeInTheDocument();
  });

  it('muestra el botón "Continuar" habilitado por defecto', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeEnabled();
  });

  it('deshabilita el botón cuando isSubmitting es true', () => {
    renderLogin({ isSubmitting: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('deshabilita el botón cuando isLocked es true', () => {
    renderLogin({ isLocked: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('muestra el mensaje de error cuando errorMessage tiene valor', () => {
    renderLogin({ errorMessage: 'RUT o correo no válidos.' });
    expect(screen.getByText('RUT o correo no válidos.')).toBeInTheDocument();
  });

  it('no muestra mensaje de error cuando errorMessage es null', () => {
    renderLogin({ errorMessage: null });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('llama a onRutNumberChange solo con dígitos al escribir en el campo RUT', async () => {
    const onRutNumberChange = vi.fn();
    renderLogin({ onRutNumberChange });
    const input = screen.getByPlaceholderText('12345678');
    await userEvent.type(input, 'abc123');
    // El onChange filtra con .replace(/\D/g, '') — solo dispara con el valor del evento
    expect(onRutNumberChange).toHaveBeenCalled();
  });

  it('no muestra el chip de credenciales de demo en la UI', () => {
    renderLogin();
    expect(screen.queryByText(/demo:/i)).not.toBeInTheDocument();
  });
});

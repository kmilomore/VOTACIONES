import { describe, expect, it } from 'vitest';

import { submitVote, verifyOtpCode, verifyUserCredentials } from '@/lib/mock-api';

describe('mock-api — verifyUserCredentials', () => {
  it('resuelve con el usuario cuando RUT y email son correctos', async () => {
    const user = await verifyUserCredentials('12345678-9', 'usuario@slep.cl');
    expect(user.fullName).toBeTruthy();
    expect(user.organization).toBeTruthy();
  });

  it('normaliza puntos y mayúsculas en el RUT', async () => {
    const user = await verifyUserCredentials('12.345.678-9', 'USUARIO@SLEP.CL');
    expect(user).toBeDefined();
  });

  it('lanza error con credenciales incorrectas', async () => {
    await expect(verifyUserCredentials('00000000-0', 'wrong@slep.cl')).rejects.toThrow();
  });
});

describe('mock-api — verifyOtpCode', () => {
  it('resuelve con el OTP correcto', async () => {
    await expect(verifyOtpCode('123456')).resolves.toBeDefined();
  });

  it('lanza error con OTP incorrecto', async () => {
    await expect(verifyOtpCode('000000')).rejects.toThrow();
  });
});

describe('mock-api — submitVote', () => {
  it('devuelve receiptCode y candidate para un candidato válido', async () => {
    const result = await submitVote('marisol-huerta');
    expect(result.receiptCode).toMatch(/^SLEP-MH-/);
    expect(result.candidate.name).toBe('Marisol Huerta');
  });

  it('receiptCode no contiene timestamp (formato UUID fragmento)', async () => {
    const result = await submitVote('jorge-barahona');
    // UUID hex fragment: solo caracteres hex y longitud 8
    const suffix = result.receiptCode.split('-').pop() ?? '';
    expect(suffix).toMatch(/^[0-9A-F]{8}$/);
  });

  it('lanza error para un candidateId inexistente', async () => {
    await expect(submitVote('candidato-inexistente')).rejects.toThrow();
  });
});

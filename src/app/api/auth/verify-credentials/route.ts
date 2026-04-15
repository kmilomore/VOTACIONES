import { NextResponse } from 'next/server';

import { toPublicUser, verifyUserCredentials } from '@/lib/mock-api';
import { createSession, SESSION_COOKIE_NAME } from '@/lib/server-session';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { rut?: string; email?: string };
    const rut = body.rut?.trim() ?? '';
    const email = body.email?.trim() ?? '';

    if (!rut || !email) {
      return NextResponse.json(
        { message: 'Debes ingresar RUT y correo para continuar.' },
        { status: 400 },
      );
    }

    // Validate RUT format server-side: 7-8 digits, dash, digit or K.
    // Example valid forms: "12345678-5", "1234567-k"
    if (!/^\d{7,8}-[\dkK]$/.test(rut)) {
      return NextResponse.json(
        { message: 'No encontramos una coincidencia valida para el RUT y correo ingresados.' },
        { status: 401 },
      );
    }

    // Normalize email length to prevent oversized payloads.
    if (email.length > 254) {
      return NextResponse.json(
        { message: 'No encontramos una coincidencia valida para el RUT y correo ingresados.' },
        { status: 401 },
      );
    }

    const user = await verifyUserCredentials(rut, email);
    const sessionId = createSession(user.rut);

    const response = NextResponse.json({ user: toPublicUser(user) });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 10 * 60,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error
          ? error.message
          : 'No fue posible validar la identidad.',
      },
      { status: 401 },
    );
  }
}
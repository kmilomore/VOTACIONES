import type { Metadata } from 'next';
import { headers } from 'next/headers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Portal de Votacion | SLEP Santiago Centro',
  description: 'Frontend modular del Portal de Votacion del Consejo Local para SLEP Santiago Centro.',
  robots: { index: false, follow: false },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Calling headers() forces dynamic rendering per-request. Next.js then reads
  // the x-nonce header (set by middleware) and automatically injects it as a
  // nonce attribute on all generated <script> tags, satisfying the CSP policy.
  await headers();

  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
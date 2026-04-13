import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Portal de Votacion | SLEP Santiago Centro',
  description: 'Frontend modular del Portal de Votacion del Consejo Local para SLEP Santiago Centro.',
  robots: { index: false, follow: false },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
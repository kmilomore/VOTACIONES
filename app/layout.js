import './globals.css';

export const metadata = {
  title: 'Votaciones',
  description: 'Aplicacion de votaciones con Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
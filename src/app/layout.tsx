import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import AuthGuard from '../components/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sillar Inmobiliaria CRM',
  description: 'Sistema de Gestión Inmobiliaria',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="light">
      <body className={`${inter.className} bg-base-200 min-h-screen`}>
        {/* 👇 EL PROVEEDOR ENVUELVE A LA APP ENTERA */}
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
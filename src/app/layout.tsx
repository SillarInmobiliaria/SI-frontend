import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import AuthGuard from '../components/AuthGuard';
import Mantenimiento from '../components/Mantenimiento';
import FeedbackModal from '../components/FeedbackModal'; 

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
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MODO_MANTENIMIENTO === 'true';

  return (
    <html lang="es" data-theme="light">
      <body className={`${inter.className} bg-base-200 min-h-screen`}>
        
        {/* CONDICIONAL MAESTRA */}
        {isMaintenanceMode ? (
          <Mantenimiento />
        ) : (
          <AuthProvider>
            <AuthGuard>
              {children}
              <FeedbackModal />
            </AuthGuard>
          </AuthProvider>
        )}

      </body>
    </html>
  );
}
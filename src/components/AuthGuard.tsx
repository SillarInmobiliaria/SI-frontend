'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Lista de páginas públicas (donde no necesitas estar logueado)
  const publicPages = ['/login', '/registro'];

  useEffect(() => {
    if (!loading) {
      // Si NO hay usuario Y NO estamos en una página pública, mandar al login
      if (!user && !publicPages.includes(pathname)) {
        router.push('/login');
      }
      
      // Si YA hay usuario y trata de entrar al login, mandarlo al dashboard
      if (user && publicPages.includes(pathname)) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (user || publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  return null;
}
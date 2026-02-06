'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AriAI from './AriAI'; 

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPages = ['/login', '/registro'];

  useEffect(() => {
    if (!loading) {
      if (!user && !publicPages.includes(pathname)) {
        router.push('/login');
      }
      if (user && publicPages.includes(pathname)) {
        router.push('/');
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
    return (
      <>
        {children}
        
        {/* Solo mostramos a Ari si hay un usuario logueado */}
        {user && <AriAI />} 
      </>
    );
  }

  return null;
}
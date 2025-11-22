'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto p-6">
        
        {/* HERO */}
        <div className="hero bg-base-100 rounded-box p-10 mb-10 shadow-md">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-primary">🏠 Panel de Control</h1>
              <p className="py-6 text-lg text-gray-500">Bienvenido a Sillar Inmobiliaria. Selecciona un módulo para gestionar.</p>
            </div>
          </div>
        </div>

        {/* TARJETAS DE ACCESO RÁPIDO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* CARD 1: PROPIETARIOS */}
          <Link href="/propietarios" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-info">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">👔</div>
              <h2 className="card-title text-2xl">Propietarios</h2>
              <p className="text-gray-500">Gestionar dueños de inmuebles</p>
            </div>
          </Link>

          {/* CARD 2: PROPIEDADES */}
          <Link href="/propiedades" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-success">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">🏡</div>
              <h2 className="card-title text-2xl">Propiedades</h2>
              <p className="text-gray-500">Inventario de casas y depas</p>
            </div>
          </Link>

          {/* CARD 3: CLIENTES */}
          <Link href="/clientes" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-warning">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">🙋‍♂️</div>
              <h2 className="card-title text-2xl">Clientes</h2>
              <p className="text-gray-500">Cartera de compradores</p>
            </div>
          </Link>

          {/* CARD 4: INTERESES (ACTUALIZADA) */}
          <Link href="/intereses" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-error">
            <div className="card-body items-center text-center">
              {/* 👇 CAMBIO: Emoji más serio (Portapapeles de seguimiento) */}
              <div className="text-5xl mb-2">📋</div>
              <h2 className="card-title text-2xl">Intereses</h2>
              {/* 👇 CAMBIO: Descripción más formal */}
              <p className="text-gray-500">Seguimiento de clientes potenciales</p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
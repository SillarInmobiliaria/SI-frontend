'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto p-6">
        
        {/* HERO BANNER */}
        <div className="hero bg-base-100 rounded-box p-10 mb-10 shadow-md">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-primary">🏠 Panel de Control</h1>
              <p className="py-6 text-lg text-gray-500">
                Bienvenido al sistema Sillar Inmobiliaria. Selecciona un módulo.
              </p>
            </div>
          </div>
        </div>

        {/* GRID DE TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* ⭐ NUEVO: DASHBOARD ADMIN (Estadísticas y Excel) */}
          <Link href="/admin/dashboard" className="card bg-white shadow-xl hover:scale-105 transition-transform cursor-pointer border-l-8 border-purple-600">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">📊</div>
              <h2 className="card-title text-2xl font-bold text-purple-700">Dashboard Admin</h2>
              <p className="text-gray-500">Estadísticas, Reportes y Excel</p>
            </div>
          </Link>

          {/* 1. PROPIETARIOS */}
          <Link href="/propietarios" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-info">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">👔</div>
              <h2 className="card-title text-2xl">Propietarios</h2>
              <p className="text-gray-500">Gestionar dueños de inmuebles</p>
            </div>
          </Link>

          {/* 2. PROPIEDADES */}
          <Link href="/propiedades" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-success">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">🏡</div>
              <h2 className="card-title text-2xl">Propiedades</h2>
              <p className="text-gray-500">Inventario de casas y depas</p>
            </div>
          </Link>

          {/* 3. CLIENTES */}
          <Link href="/clientes" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-warning">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">🙋‍♂️</div>
              <h2 className="card-title text-2xl">Clientes</h2>
              <p className="text-gray-500">Cartera de compradores</p>
            </div>
          </Link>

          {/* 4. INTERESADOS */}
          <Link href="/intereses" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-error">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">📋</div> 
              <h2 className="card-title text-2xl">Interesados</h2>
              <p className="text-gray-500">Seguimiento de clientes potenciales</p>
            </div>
          </Link>

          {/* 5. GESTIÓN & CIERRES */}
          <Link href="/gestion" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-secondary">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">💰</div> 
              <h2 className="card-title text-2xl">Gestión & Cierres</h2>
              <p className="text-gray-500">Registrar ventas y alquileres</p>
            </div>
          </Link>

          {/* 6. VISITAS FÍSICAS */}
          <Link href="/visitas" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-primary">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">📍</div> 
              <h2 className="card-title text-2xl">Visitas Físicas</h2>
              <p className="text-gray-500">Bitácora de salidas y resultados</p>
            </div>
          </Link>

          {/* 7. SEGUIMIENTO */}
          <Link href="/seguimiento" className="card bg-base-100 shadow-xl hover:scale-105 transition-transform cursor-pointer border-b-4 border-accent">
            <div className="card-body items-center text-center">
              <div className="text-5xl mb-2">📞</div> 
              <h2 className="card-title text-2xl">Seguimiento</h2>
              <p className="text-gray-500">Historial de llamadas y mensajes</p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}
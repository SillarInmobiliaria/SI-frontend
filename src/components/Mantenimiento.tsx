'use client';

import React from 'react';
import { FaTools, FaHardHat } from 'react-icons/fa'; // Asegúrate de tener react-icons

export default function Mantenimiento() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      
      {/* Círculo animado con icono */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        <div className="relative bg-slate-800 p-6 rounded-full border-2 border-blue-400 shadow-2xl shadow-blue-500/20">
            <FaHardHat className="text-6xl text-yellow-400" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
        Sistemas en <span className="text-blue-400">Mantenimiento</span>
      </h1>
      
      <p className="text-slate-400 text-lg max-w-lg mx-auto mb-8">
        Estamos aplicando mejoras importantes y actualizaciones de seguridad para brindarte un mejor servicio. 🦁
      </p>

      {/* Tarjeta de estado */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-auto">
        <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Estado del Servidor</span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                ACTUALIZANDO
            </span>
        </div>
        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-2/3 animate-[shimmer_2s_infinite]"></div>
        </div>
        <p className="text-xs text-slate-500 mt-3 font-mono">
            Código: SYSTEM_UPGRADE_V2
        </p>
      </div>

      <p className="text-slate-600 text-sm mt-12">
        &copy; {new Date().getFullYear()} Sillar Inmobiliaria. Regresamos en breve.
      </p>
    </div>
  );
}
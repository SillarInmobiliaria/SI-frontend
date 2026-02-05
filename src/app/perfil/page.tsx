'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext'; 

export default function PerfilPage() {
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState({
    nombre: '',
    cargo: 'Asesor Inmobiliario',
    correo: '',
    telefono: '',
    nacimiento: '',
    bio: '',
    foto: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
    fondoColor: '#7c3aed' 
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedDetails = localStorage.getItem('userProfileDetails');
    const details = savedDetails ? JSON.parse(savedDetails) : {};

    setUser({
      ...user,
      ...details,
      nombre: currentUser?.nombre || details.nombre || 'Usuario',
      correo: currentUser?.email || details.correo || 'correo@sillar.com'
    });
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userProfileDetails', JSON.stringify(user));
    setIsEditing(false);
    alert('✅ Perfil actualizado correctamente');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto p-6">
        
        <div className="card bg-base-100 shadow-2xl overflow-hidden border border-base-300">
          
          <div 
            className="h-52 relative transition-colors duration-500"
            style={{ backgroundColor: user.fondoColor }}
          >
            {isEditing && (
              <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-lg shadow-md backdrop-blur-sm flex items-center gap-2">
                <span className="text-xs font-bold text-black uppercase">Color de Portada</span>
                <input 
                  type="color" 
                  name="fondoColor"
                  value={user.fondoColor}
                  onChange={handleChange}
                  className="w-8 h-8 cursor-pointer border-none bg-transparent"
                />
              </div>
            )}
          </div>
          
          <div className="card-body pt-0 relative px-8">
            
            {/* FOTO Y CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-end -mt-16 mb-8 gap-4">
              <div className="flex items-end gap-4">
                <div className="avatar border-4 border-base-100 rounded-full shadow-lg bg-base-100">
                  <div className="w-32 rounded-full">
                    <img src={user.foto} alt="Perfil" />
                  </div>
                </div>
                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-base-content">{user.nombre}</h1>
                  <p className="text-primary font-semibold text-lg">{user.cargo}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                className={`btn px-6 shadow-md ${isEditing ? 'btn-error text-white' : 'btn-primary'}`}
              >
                {isEditing ? 'Cancelar' : 'Editar Perfil ✏️'}
              </button>
            </div>

            <div className="divider my-0"></div>

            {/* FORMULARIO DE DATOS */}
            <form onSubmit={handleSave} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* DATOS DE CUENTA (Bloqueados) */}
                <div className="form-control">
                  <label className="label font-bold text-gray-500">Nombre Completo (Cuenta)</label>
                  <div className="relative">
                    <input type="text" value={user.nombre} disabled className="input input-bordered w-full h-12 px-4 text-lg bg-base-200 text-gray-500 border-dashed" />
                    <span className="absolute right-4 top-3 text-gray-400">🔒</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label font-bold text-gray-500">Correo (Cuenta)</label>
                  <div className="relative">
                    <input type="email" value={user.correo} disabled className="input input-bordered w-full h-12 px-4 text-lg bg-base-200 text-gray-500 border-dashed" />
                    <span className="absolute right-4 top-3 text-gray-400">🔒</span>
                  </div>
                </div>

                {/* DATOS EDITABLES */}
                <div className="form-control">
                  <label className="label font-bold text-primary">Cargo / Título</label>
                  <input 
                    type="text" name="cargo" 
                    value={user.cargo} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="input input-bordered w-full h-12 px-4 text-lg disabled:bg-transparent disabled:border-none disabled:pl-0 disabled:text-base-content" 
                    placeholder="Ej: Asesor Senior"
                  />
                </div>

                {/* TELÉFONO VALIDADO (9 dígitos, solo números) */}
                <div className="form-control">
                  <label className="label font-bold text-primary">Teléfono / Celular</label>
                  <input 
                    type="text" 
                    name="telefono" 
                    value={user.telefono} 
                    disabled={!isEditing} 
                    className="input input-bordered w-full h-12 px-4 text-lg disabled:bg-transparent disabled:border-none disabled:pl-0 disabled:text-base-content" 
                    placeholder="900000000"
                    maxLength={9}
                    onChange={(e) => {
                      // Solo permite números
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setUser({ ...user, telefono: val });
                    }}
                  />
                </div>

                <div className="form-control">
                  <label className="label font-bold text-primary">Fecha de Nacimiento</label>
                  <input 
                    type="date" name="nacimiento" 
                    value={user.nacimiento} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="input input-bordered w-full h-12 px-4 text-lg disabled:bg-transparent disabled:border-none disabled:pl-0 disabled:text-base-content" 
                  />
                </div>

                <div className="form-control">
                  <label className="label font-bold text-primary">URL Foto (Opcional)</label>
                  <input 
                    type="text" name="foto" 
                    value={user.foto} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="input input-bordered w-full h-12 px-4 text-lg disabled:bg-transparent disabled:border-none disabled:pl-0 disabled:text-base-content" 
                    placeholder="https://..."
                  />
                </div>

                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label font-bold text-primary">Bio / Presentación</label>
                  <textarea 
                    name="bio" 
                    value={user.bio} onChange={handleChange} 
                    disabled={!isEditing} 
                    className="textarea textarea-bordered w-full h-32 text-lg resize-none p-4 disabled:bg-transparent disabled:border-none disabled:pl-0 disabled:text-base-content" 
                    placeholder="Escribe una breve descripción sobre tu experiencia..."
                  />
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end">
                  <button type="submit" className="btn px-8 shadow-lg text-lg font-bold border-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 transition-transform">
                    Guardar Cambios
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
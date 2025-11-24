'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useInmobiliariaStore } from '../../../store/useInmobiliariaStore';
import { createPropiedad } from '../../../services/api';
import { FaHome, FaMapMarkedAlt, FaImages, FaUserTie, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

const UBICACIONES = ["Arequipa", "Yanahuara", "Cayma", "Cerro Colorado", "Jose Luis Bustamante y Rivero", "Sachaca", "Miraflores", "Mariano Melgar", "Paucarpata", "Socabaya", "Jacobo Hunter", "Alto Selva Alegre", "Tiabaya", "Uchumayo", "Characato", "Sabandía", "Mollebaya", "Yura", "La Joya", "Mollendo", "Camaná", "Mejía", "Pedregal"];

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const { propietarios, fetchPropietarios } = useInmobiliariaStore();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPropietarios(); }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Crear el "Sobre" para enviar archivos (FormData)
      const formData = new FormData();

      // Meter los datos de texto
      formData.append('tipo', data.tipo);
      formData.append('modalidad', data.modalidad);
      formData.append('ubicacion', data.ubicacion);
      formData.append('direccion', data.direccion);
      formData.append('moneda', data.moneda);
      formData.append('precio', data.precio);
      formData.append('area', data.area);
      formData.append('areaConstruida', data.areaConstruida);
      formData.append('habitaciones', data.habitaciones);
      formData.append('banos', data.banos);
      formData.append('cocheras', data.cocheras);
      formData.append('descripcion', data.descripcion);
      formData.append('distribucion', data.distribucion);
      formData.append('propietarioId', data.propietarioId);
      if(data.asesor) formData.append('asesor', data.asesor);
      if(data.mapaUrl) formData.append('mapaUrl', data.mapaUrl);
      if(data.videoUrl) formData.append('videoUrl', data.videoUrl);

      // Meter los archivos (Si existen)
      if (data.fotoPrincipal[0]) {
        formData.append('fotoPrincipal', data.fotoPrincipal[0]);
      }
      if (data.pdf[0]) {
        formData.append('pdf', data.pdf[0]);
      }
      // Galería (Múltiples archivos)
      if (data.galeria && data.galeria.length > 0) {
        for (let i = 0; i < data.galeria.length; i++) {
          formData.append('galeria', data.galeria[i]);
        }
      }

      // 4. Enviar el sobre al backend
      await createPropiedad(formData);
      
      alert('✅ Propiedad publicada con fotos y documentos');
      router.push('/propiedades');
    } catch (error) {
      alert('❌ Error al publicar');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-12">
      <Navbar />
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/propiedades" className="btn btn-circle btn-ghost"><FaArrowLeft /></Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">Publicar Nueva Propiedad</h1>
              <p className="text-gray-500">Completa la ficha técnica del inmueble</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

           {/* DATOS GENERALES */}
           <div className="card bg-base-100 shadow-xl border-t-4 border-primary">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 mb-4"><FaHome className="text-primary" /> Datos Generales</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="form-control"><label className="label font-bold">Tipo</label><select {...register('tipo')} className="select select-bordered w-full text-lg"><option value="Casa">Casa</option><option value="Departamento">Departamento</option><option value="Terreno">Terreno</option><option value="Local">Local</option></select></div>
                <div className="form-control"><label className="label font-bold">Modalidad</label><select {...register('modalidad')} className="select select-bordered w-full text-lg"><option value="Venta">Venta</option><option value="Alquiler">Alquiler</option></select></div>
                <div className="form-control"><label className="label font-bold">Ubicación</label><select {...register('ubicacion')} className="select select-bordered w-full text-lg">{UBICACIONES.map(u => <option key={u} value={u}>{u}</option>)}</select></div>
              </div>
              <div className="form-control mt-4"><label className="label font-bold">Dirección</label><input {...register('direccion', { required: true })} type="text" className="input input-bordered w-full text-lg" /></div>
            </div>
          </div>

           {/* PRECIO */}
           <div className="card bg-base-100 shadow-xl border-t-4 border-secondary">
            <div className="card-body">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="form-control"><label className="label font-bold">Moneda</label><select {...register('moneda')} className="select select-bordered w-full text-lg font-bold"><option value="USD">Dólares</option><option value="PEN">Soles</option></select></div>
                 <div className="form-control md:col-span-3"><label className="label font-bold">Precio</label><input {...register('precio', { required: true })} type="number" className="input input-bordered w-full text-2xl font-bold text-success" /></div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                 <div className="form-control"><label className="label font-bold">Área T.</label><input {...register('area')} type="number" className="input input-bordered w-full" /></div>
                 <div className="form-control"><label className="label-text font-bold">Área C.</label><input {...register('areaConstruida')} type="number" className="input input-bordered w-full" /></div>
               </div>
            </div>
           </div>

           {/* CARACTERÍSTICAS */}
           <div className="card bg-base-100 shadow-xl border-t-4 border-accent">
             <div className="card-body">
               <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="form-control"><label className="label font-bold text-center">Habitaciones</label><input {...register('habitaciones')} type="number" className="input input-bordered text-center" defaultValue={0}/></div>
                  <div className="form-control"><label className="label font-bold text-center">Baños</label><input {...register('banos')} type="number" className="input input-bordered text-center" defaultValue={0}/></div>
                  <div className="form-control"><label className="label font-bold text-center">Cocheras</label><input {...register('cocheras')} type="number" className="input input-bordered text-center" defaultValue={0}/></div>
               </div>
               
               <div className="space-y-8">
                 <div className="form-control w-full">
                   <label className="label font-bold">Descripción</label>
                   <textarea {...register('descripcion')} className="textarea textarea-bordered h-32 text-lg w-full" />
                 </div>
                 
                 <div className="form-control w-full">
                   <label className="label font-bold">Distribución Técnica</label>
                   <textarea {...register('distribucion')} className="textarea textarea-bordered h-48 font-mono text-sm w-full" />
                 </div>
               </div>
             </div>
           </div>


          {/* MULTIMEDIA Y DOCUMENTOS (ACTUALIZADA) */}
          <div className="card bg-base-100 shadow-xl border-t-4 border-warning">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 mb-4">
                <FaImages className="text-warning" /> Multimedia y Archivos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* FOTO PRINCIPAL */}
                <div className="form-control">
                  <label className="label font-bold text-primary">1. Foto Principal (Portada)</label>
                  <input 
                    {...register('fotoPrincipal', { required: true })} 
                    type="file" 
                    accept="image/*"
                    className="file-input file-input-bordered file-input-primary w-full" 
                  />
                </div>

                {/* GALERÍA */}
                <div className="form-control">
                  <label className="label font-bold text-secondary">2. Galería (Fotos Secundarias)</label>
                  <input 
                    {...register('galeria')} 
                    type="file" 
                    multiple 
                    accept="image/*"
                    className="file-input file-input-bordered file-input-secondary w-full" 
                  />
                  <label className="label text-xs">Puedes seleccionar varias fotos a la vez.</label>
                </div>

                {/* PDF */}
                <div className="form-control">
                  <label className="label font-bold text-error">3. Ficha Técnica (PDF)</label>
                  <input 
                    {...register('pdf')} 
                    type="file" 
                    accept=".pdf"
                    className="file-input file-input-bordered file-input-error w-full" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="form-control">
                  <label className="label font-bold">Video (YouTube Link)</label>
                  <input {...register('videoUrl')} type="text" className="input input-bordered w-full" placeholder="https://youtu.be/..." />
                </div>
                <div className="form-control">
                  <label className="label font-bold">Mapa (Google Maps iframe)</label>
                  <input {...register('mapaUrl')} type="text" className="input input-bordered w-full" placeholder="<iframe..." />
                </div>
              </div>
            </div>
          </div>

          {/* GESTIÓN INTERNA */}
           <div className="card bg-base-100 shadow-xl border-t-4 border-info">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control"><label className="label font-bold">Propietario</label><select {...register('propietarioId', { required: true })} className="select select-bordered w-full text-lg"><option value="">Seleccione...</option>{propietarios.map((prop) => (<option key={prop.id} value={prop.id}>{prop.nombre}</option>))}</select></div>
                <div className="form-control"><label className="label font-bold">Asesor</label><input {...register('asesor')} type="text" className="input input-bordered w-full text-lg" /></div>
              </div>
            </div>
          </div>


          {/* BOTONES DE ACCIÓN */}
          <div className="flex gap-4 justify-end pt-6">
            <Link href="/propiedades" className="btn btn-lg btn-ghost">Cancelar</Link>
            <button 
              type="submit" 
              className={`btn btn-lg btn-primary px-12 shadow-xl ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <FaSave /> {loading ? 'Subir Archivos y Guardar' : 'Publicar Propiedad'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
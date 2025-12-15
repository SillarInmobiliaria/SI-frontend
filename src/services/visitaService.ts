const API_URL = 'http://localhost:4000/api/visitas';

export const visitaService = {
    // 1. Obtener todas las visitas
    obtenerVisitas: async (token: string) => {
        const res = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error('Error al obtener visitas');
        return await res.json();
    },

    // 2. Crear nueva visita
    crearVisita: async (token: string, datos: any) => {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error('Error al crear visita');
        return await res.json();
    },

    // 3. Actualizar estado (Completar/Cancelar)
    actualizarVisita: async (token: string, id: string, datos: any) => {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        if (!res.ok) throw new Error('Error al actualizar visita');
        return await res.json();
    }
};
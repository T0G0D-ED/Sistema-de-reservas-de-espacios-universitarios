
// Lee la variable de tu .env (Vite requiere el prefijo VITE_)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Funcion generica para hacer peticiones (se puede usar fetch o axios)
export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
  },
  
  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    return response.json();
  }
};
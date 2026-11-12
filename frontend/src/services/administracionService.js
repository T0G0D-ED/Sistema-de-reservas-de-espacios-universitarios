import { api } from "./api";

export const listarEdificiosAdministracion = () => api.get("/api/administracion/edificios");
export const listarEspaciosAdministracion = () => api.get("/api/administracion/espacios");
export const crearEdificio = (edificio) => api.post("/api/administracion/edificios", edificio);
export const actualizarEdificio = (id, edificio) => api.put(`/api/administracion/edificios/${id}`, edificio);
export const cambiarEstadoEdificio = (id, activo) => api.patch(`/api/administracion/edificios/${id}/activo`, { activo });
export const crearEspacio = (espacio) => api.post("/api/administracion/espacios", espacio);
export const actualizarEspacio = (id, espacio) => api.put(`/api/administracion/espacios/${id}`, espacio);
export const cambiarDisponibilidadEspacio = (id, disponible) => api.patch(`/api/administracion/espacios/${id}/disponible`, { disponible });

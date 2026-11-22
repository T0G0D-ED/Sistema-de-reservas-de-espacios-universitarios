import { get, patch, post, put } from "./api";

export const listarEdificios = () => get("/api/administracion/edificios");
export const listarEspacios = () => get("/api/administracion/espacios");
export const crearEdificio = (edificio) => post("/api/administracion/edificios", edificio);
export const actualizarEdificio = (id, edificio) => put(`/api/administracion/edificios/${id}`, edificio);
export const cambiarEstadoEdificio = (id, activo) => patch(`/api/administracion/edificios/${id}/activo`, { activo });
export const crearEspacio = (espacio) => post("/api/administracion/espacios", espacio);
export const actualizarEspacio = (id, espacio) => put(`/api/administracion/espacios/${id}`, espacio);
export const cambiarDisponibilidadEspacio = (id, disponible) => patch(`/api/administracion/espacios/${id}/disponible`, { disponible });

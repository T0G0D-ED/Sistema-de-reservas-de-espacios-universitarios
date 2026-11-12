import { useEffect, useState } from "react";
import {
  actualizarEdificio as actualizarEdificioService,
  actualizarEspacio as actualizarEspacioService,
  cambiarDisponibilidadEspacio,
  cambiarEstadoEdificio,
  crearEdificio as crearEdificioService,
  crearEspacio as crearEspacioService,
  listarEdificiosAdministracion,
  listarEspaciosAdministracion,
} from "../services/administracionService";

export function useAdministracion(activo) {
  const [edificios, setEdificios] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    if (!activo) return () => { vigente = false; };

    setCargando(true);
    setError(null);
    Promise.all([listarEdificiosAdministracion(), listarEspaciosAdministracion()])
      .then(([listaEdificios, listaEspacios]) => {
        if (!vigente) return;
        setEdificios(listaEdificios);
        setEspacios(listaEspacios);
      })
      .catch((err) => {
        console.error("Error al cargar los datos de administración:", err);
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => { vigente = false; };
  }, [activo, intento]);

  async function ejecutarYRecargar(operacion) {
    const resultado = await operacion();
    setIntento((actual) => actual + 1);
    return resultado;
  }

  return {
    edificios,
    espacios,
    cargando,
    error,
    reintentar: () => setIntento((actual) => actual + 1),
    crearEdificio: (edificio) => ejecutarYRecargar(() => crearEdificioService(edificio)),
    actualizarEdificio: (id, edificio) => ejecutarYRecargar(() => actualizarEdificioService(id, edificio)),
    cambiarEstadoEdificio: (id, activo) => ejecutarYRecargar(() => cambiarEstadoEdificio(id, activo)),
    crearEspacio: (espacio) => ejecutarYRecargar(() => crearEspacioService(espacio)),
    actualizarEspacio: (id, espacio) => ejecutarYRecargar(() => actualizarEspacioService(id, espacio)),
    cambiarDisponibilidad: (id, disponible) => ejecutarYRecargar(() => cambiarDisponibilidadEspacio(id, disponible)),
  };
}

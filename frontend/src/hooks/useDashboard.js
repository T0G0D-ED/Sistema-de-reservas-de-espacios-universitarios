import { useEffect, useState } from "react";
import { obtenerUtilizacion } from "../services/dashboardService";

export function useDashboard(habilitado) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    if (!habilitado) {
      setDatos(null);
      setError(null);
      setCargando(false);
      return () => { vigente = false; };
    }

    setCargando(true);
    setError(null);
    obtenerUtilizacion()
      .then((resultado) => {
        if (vigente) setDatos(resultado);
      })
      .catch((err) => {
        console.error("Error al cargar utilización:", err);
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => { vigente = false; };
  }, [habilitado, intento]);

  return {
    datos,
    cargando,
    error,
    reintentar: () => setIntento((actual) => actual + 1),
  };
}

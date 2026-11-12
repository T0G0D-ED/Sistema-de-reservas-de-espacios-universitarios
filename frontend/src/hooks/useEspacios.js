import { useCallback, useEffect, useState } from "react";
import { listarEspacios } from "../services/espaciosService";

export function useEspacios() {
  const [espacios, setEspacios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    listarEspacios()
      .then((data) => {
        if (vigente) setEspacios(data);
      })
      .catch((err) => {
        console.error("Error al cargar espacios:", err);
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => { vigente = false; };
  }, [intento]);

  const reintentar = useCallback(() => setIntento((actual) => actual + 1), []);

  return { espacios, cargando, error, reintentar };
}

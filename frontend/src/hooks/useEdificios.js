import { useEffect, useState } from "react";
import { listarEdificios } from "../services/edificiosService";

export function useEdificios() {
  const [edificios, setEdificios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    listarEdificios()
      .then((data) => {
        if (vigente) setEdificios(data);
      })
      .catch((err) => {
        console.error("Error al cargar edificios:", err);
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => { vigente = false; };
  }, [intento]);

  return {
    edificios,
    cargando,
    error,
    reintentar: () => setIntento((actual) => actual + 1),
  };
}

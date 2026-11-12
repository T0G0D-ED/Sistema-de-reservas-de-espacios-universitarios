import { useEffect, useState } from "react";
import { obtenerHistorial } from "../services/historialService";

export function useHistorial(reservas, habilitado) {
  const [reservaId, setReservaId] = useState("");
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!reservas.length) {
      setReservaId("");
      setEventos([]);
      setCargando(false);
      setError(null);
      return;
    }

    if (!reservas.some((reserva) => String(reserva.id) === reservaId)) {
      setReservaId(String(reservas[0].id));
    }
  }, [reservas, reservaId]);

  useEffect(() => {
    let vigente = true;

    if (!habilitado || !reservaId) {
      setEventos([]);
      setError(null);
      setCargando(false);
      return () => { vigente = false; };
    }

    setCargando(true);
    setError(null);
    obtenerHistorial(reservaId)
      .then((data) => {
        if (vigente) setEventos(data);
      })
      .catch((err) => {
        console.error("Error al cargar historial:", err);
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => { vigente = false; };
  }, [habilitado, reservaId, intento]);

  return {
    reservaId,
    seleccionarReserva: setReservaId,
    eventos,
    cargando,
    error,
    reintentar: () => setIntento((actual) => actual + 1),
  };
}

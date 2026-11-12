import { useEffect, useState } from "react";
import { enviarCorreoCancelacion, enviarCorreoConfirmacion } from "../services/correoService";
import {
  actualizarEstadoReserva,
  cancelarReserva as cancelarReservaService,
  crearReserva as crearReservaService,
  listarReservas,
} from "../services/reservasService";

function formatearHorario(fechaInicio, fechaFin) {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  return {
    fecha: inicio.toLocaleDateString("es-CL"),
    hora: `${inicio.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} - ${fin.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`,
  };
}

export function useReservas(sesion) {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    if (!sesion?.token) {
      setReservas([]);
      setCargando(false);
      setError(null);
      return () => { vigente = false; };
    }

    setCargando(true);
    setError(null);
    listarReservas()
      .then((data) => {
        if (vigente) setReservas(data);
      })
      .catch((err) => {
        console.error("Error al cargar reservas:", err);
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => { vigente = false; };
  }, [sesion?.token, intento]);

  async function crear(espacio, datos) {
    const [horaInicio, horaFin] = datos.hora.split(" - ");
    const fechaInicio = `${datos.fecha}T${horaInicio}:00`;
    const fechaFin = `${datos.fecha}T${horaFin}:00`;
    const reserva = await crearReservaService({
      espacioId: espacio.id,
      fechaInicio,
      fechaFin,
      motivo: datos.motivo,
    });

    setIntento((actual) => actual + 1);
    let correoEnviado = true;

    try {
      await enviarCorreoConfirmacion({
        espacioTitulo: espacio.nombre,
        fecha: datos.fecha,
        hora: datos.hora,
        correoDestino: sesion.usuario.email,
        solicitante: sesion.usuario.nombre,
      });
    } catch (err) {
      console.error("Error al enviar el correo de solicitud:", err);
      correoEnviado = false;
    }

    return { reserva, correoEnviado };
  }

  async function cancelar(id) {
    const reserva = reservas.find((item) => item.id === id);
    await cancelarReservaService(id);
    setIntento((actual) => actual + 1);

    if (!reserva) return { correoEnviado: true };

    const { fecha, hora } = formatearHorario(reserva.fecha_inicio, reserva.fecha_fin);
    try {
      await enviarCorreoCancelacion({
        espacioTitulo: reserva.espacio_nombre,
        fecha,
        hora,
        correoDestino: reserva.usuario_email || sesion.usuario.email,
        solicitante: reserva.usuario_nombre || sesion.usuario.nombre,
      });
      return { correoEnviado: true };
    } catch (err) {
      console.error("Error al enviar correo de cancelación:", err);
      return { correoEnviado: false };
    }
  }

  async function cambiarEstado(id, nuevoEstado, motivoRechazo) {
    const reserva = await actualizarEstadoReserva(id, nuevoEstado, motivoRechazo);
    setIntento((actual) => actual + 1);
    return reserva;
  }

  return {
    reservas,
    cargando,
    error,
    reintentar: () => setIntento((actual) => actual + 1),
    crear,
    cancelar,
    cambiarEstado,
  };
}

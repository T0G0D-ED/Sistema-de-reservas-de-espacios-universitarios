import { api } from "./api";

export function enviarCorreoConfirmacion({ espacioTitulo, fecha, hora, correoDestino, solicitante }) {
  return api.post("/api/enviar-correo", {
    tipo: "confirmacion",
    correoDestino,
    espacioTitulo,
    fecha,
    hora,
    solicitante,
  });
}

export function enviarCorreoCancelacion({ espacioTitulo, fecha, hora, correoDestino, solicitante }) {
  return api.post("/api/enviar-correo", {
    tipo: "cancelacion",
    correoDestino,
    espacioTitulo,
    fecha,
    hora,
    solicitante,
  });
}

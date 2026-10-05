

export async function enviarCorreoConfirmacion({ espacioTitulo, fecha, hora, correoDestino, solicitante }) {
  const respuesta = await fetch("http://localhost:3000/api/enviar-correo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: "confirmacion",
      correoDestino,
      espacioTitulo,
      fecha,
      hora,
      solicitante,
    }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || "Falló el envío del correo de confirmación");
  }

  return respuesta.json();
}

export async function enviarCorreoCancelacion({ espacioTitulo, fecha, hora, correoDestino, solicitante }) {
  const respuesta = await fetch("http://localhost:3000/api/enviar-correo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: "cancelacion",
      correoDestino,
      espacioTitulo,
      fecha,
      hora,
      solicitante,
    }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || "Falló el envío del correo de cancelación");
  }

  return respuesta.json();
}
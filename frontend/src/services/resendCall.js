export async function enviarCorreoConfirmacion({ espacioTitulo, fecha, hora, correoDestino }) {
  const respuesta = await fetch("/api/enviar-correo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correoDestino, espacioTitulo, fecha, hora }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || "Falló el envío del correo");
  }

  return respuesta.json();
}
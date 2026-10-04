import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarCorreoConfirmacion({ correoDestino, espacioTitulo, fecha, hora }) {
  const { data, error } = await resend.emails.send({
    from: "ReservaUNAB <onboarding@resend.dev>",
    to: [correoDestino],
    subject: `Reserva confirmada: ${espacioTitulo}`,
    html: `<p>Tu reserva para <strong>${espacioTitulo}</strong> el ${fecha} a las ${hora} fue confirmada.</p>`,
  });

  if (error) throw new Error(error.message);
  return data;
}
import "dotenv/config";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Plantilla con diseño HTML para confirmación
function htmlConfirmacion({ solicitante, espacioTitulo, fecha, hora }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #263762; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">¡Reserva Confirmada!</h2>
        <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Sistema de Gestión de Espacios Universitarios</p>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p>Hola <strong>${solicitante || "Estudiante"}</strong>,</p>
        <p>Tu solicitud ha sido registrada exitosamente con el siguiente detalle:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Espacio:</td>
            <td style="padding: 8px 12px; color: #0f172a;">${espacioTitulo}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Fecha:</td>
            <td style="padding: 8px 12px; color: #0f172a;">${fecha}</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Horario:</td>
            <td style="padding: 8px 12px; color: #0f172a;">${hora}</td>
          </tr>
        </table>
        <p style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 10px; font-size: 13px; color: #1e40af;">
          Recuerda llegar puntual. Si no vas a asistir, cancela la reserva para liberar la sala.
        </p>
      </div>
    </div>
  `;
}

// Plantilla con diseño HTML para cancelación
function htmlCancelacion({ solicitante, espacioTitulo, fecha, hora }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #991b1b; color: #ffffff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Reserva Cancelada</h2>
        <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Sistema de Gestión de Espacios Universitarios</p>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p>Hola <strong>${solicitante || "Estudiante"}</strong>,</p>
        <p>Te confirmamos que la siguiente reserva fue cancelada y el espacio ha quedado libre:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Espacio:</strong> ${espacioTitulo}</p>
          <p style="margin: 4px 0;"><strong>Fecha:</strong> ${fecha}</p>
          <p style="margin: 4px 0;"><strong>Horario:</strong> ${hora}</p>
        </div>
      </div>
    </div>
  `;
}

export async function enviarCorreoConfirmacion({ correoDestino, espacioTitulo, fecha, hora, solicitante }) {
  const { data, error } = await resend.emails.send({
    from: "ReservaUNAB <onboarding@resend.dev>",
    to: [correoDestino],
    subject: `Confirmación de Reserva: ${espacioTitulo}`,
    html: htmlConfirmacion({ solicitante, espacioTitulo, fecha, hora }),
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function enviarCorreoCancelacion({ correoDestino, espacioTitulo, fecha, hora, solicitante }) {
  const { data, error } = await resend.emails.send({
    from: "ReservaUNAB <onboarding@resend.dev>",
    to: [correoDestino],
    subject: `Cancelación de Reserva: ${espacioTitulo}`,
    html: htmlCancelacion({ solicitante, espacioTitulo, fecha, hora }),
  });

  if (error) throw new Error(error.message);
  return data;
}
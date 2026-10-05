export function generarHtmlConfirmacion({ solicitante, espacioTitulo, fecha, hora, motivo }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #263762; color: #ffffff; padding: 22px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Confirmación de Reserva</h2>
        <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Sistema de Gestión de Espacios Universitarios</p>
      </div>
      <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p>Hola <strong>${solicitante || "Estudiante"}</strong>,</p>
        <p>Tu solicitud de reserva ha sido confirmada con éxito:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;">
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold; color: #475569;">Espacio:</td>
            <td style="padding: 10px; color: #0f172a;">${espacioTitulo}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold; color: #475569;">Fecha:</td>
            <td style="padding: 10px; color: #0f172a;">${fecha}</td>
          </tr>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold; color: #475569;">Horario:</td>
            <td style="padding: 10px; color: #0f172a;">${hora}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px; font-weight: bold; color: #475569;">Motivo:</td>
            <td style="padding: 10px; color: #0f172a;">${motivo || "Actividad académica"}</td>
          </tr>
        </table>
        <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px; font-size: 12px; color: #1e40af; border-radius: 4px;">
          <strong>Importante:</strong> Si no podrás asistir, libera el espacio desde el sistema para que otros compañeros puedan utilizarlo.
        </div>
      </div>
    </div>
  `;
}

export function generarHtmlCancelacion({ solicitante, espacioTitulo, fecha, hora }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #991b1b; color: #ffffff; padding: 22px; text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">Reserva Cancelada</h2>
        <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">Sistema de Gestión de Espacios Universitarios</p>
      </div>
      <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
        <p>Hola <strong>${solicitante || "Estudiante"}</strong>,</p>
        <p>Te confirmamos que la siguiente reserva ha sido cancelada y el espacio ha quedado libre:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 14px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Espacio:</strong> ${espacioTitulo}</p>
          <p style="margin: 4px 0;"><strong>Fecha:</strong> ${fecha}</p>
          <p style="margin: 4px 0;"><strong>Horario:</strong> ${hora}</p>
        </div>
        <p style="font-size: 12px; color: #64748b;">Puedes volver a agendar en cualquier momento desde el catálogo de espacios.</p>
      </div>
    </div>
  `;
}
import { Resend } from 'resend';
import { getGlobalSettingsAdmin } from './admin-services';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdminNotification(type: 'contacto' | 'clases', formData: any) {
  // Aquí podrías traer el mail desde fetchGeneralSettings()
  const { data: settings } = await getGlobalSettingsAdmin(); // Ya la tenés en admin-services.ts
  const adminEmail = settings?.email || "tu-email@default.com";

  return await resend.emails.send({
    from: 'Escuela Barrial <avisos@tu-dominio.com>',
    to: [adminEmail],
    subject: `Nuevo formulario de ${type}: ${formData.fullname || formData.name}`,
    html: `<p>Tenés una nueva entrada: ${JSON.stringify(formData)}</p>`
  });
}
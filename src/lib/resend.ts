// src/lib/resend.ts
import { Resend } from 'resend';
import { fetchGeneralSettings } from '@/services/settings-services';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function getEmailSettings() {
  const settings = await fetchGeneralSettings() as any; 
  return {
    schoolEmail: settings?.email || "escuelademusicabarrial@gmail.com",
    schoolName: settings?.school_name || "Escuela de Música Barrial",
    senderEmail: "notificaciones@escuelademusicabarrial.ar" 
  };
}

const footer = `
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px;">
    <p style="margin: 0;">🎶 <b>Escuela de Música Barrial</b></p>
    <p style="margin: 5px 0 0;">"La música transforma el barrio"</p>
  </div>
`;

export const userEmailTemplate = (title: string, content: string) => `
  <div style="font-family: 'Georgia', serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px; padding: 40px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 40px;">🎸</span>
    </div>
    <h1 style="color: #f97316; text-align: center; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${title}</h1>
    <div style="font-size: 16px; line-height: 1.8; color: #444; margin-top: 25px;">
      ${content}
    </div>
    ${footer}
  </div>
`;

export const adminEmailTemplate = (action: string, details: string) => `
  <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: auto; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background-color: #f97316; padding: 20px; text-align: center;">
      <h2 style="margin: 0; color: #fff; font-size: 18px; text-transform: uppercase;">🔔 Notificación Interna</h2>
      <p style="margin: 5px 0 0; color: #ffedd5; font-size: 14px;">${action}</p>
    </div>
    <div style="padding: 30px; background-color: #fff; color: #334155; line-height: 1.6;">
      ${details}
    </div>
    <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      Este es un mensaje automático del sistema web.
    </div>
  </div>
`;
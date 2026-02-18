"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { FormSubmission } from "@/types"; // Importamos el tipo unión
import { resend, getEmailSettings, adminEmailTemplate, userEmailTemplate } from "@/lib/resend";
import { z } from "zod";

// --- ESQUEMAS DE VALIDACIÓN (ZOD) ---
const BaseSchema = z.object({
  fullname: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(6, "Teléfono inválido"),
});

const EnrollmentSchema = BaseSchema.extend({
  type: z.literal("clases"),
  instrument: z.string().min(1, "Instrumento requerido"),
  role: z.enum(["alumno", "docente"]),
  message: z.string().optional(),
});

const ContactSchema = BaseSchema.extend({
  type: z.literal("contacto"),
  message: z.string().min(1, "Mensaje requerido"),
});

const SubmissionSchema = z.discriminatedUnion("type", [EnrollmentSchema, ContactSchema]);

// Función simple para escapar caracteres HTML peligrosos
const escapeHtml = (unsafe: string | undefined) => {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export async function submitForm(data: FormSubmission) {
  try {
    // 0. Validación de datos en el servidor (Seguridad extra)
    const validation = SubmissionSchema.safeParse(data);
    if (!validation.success) {
      const errorMessage = validation.error.issues.map(e => e.message).join(", ");
      return { success: false, error: `Datos inválidos: ${errorMessage}` };
    }

    const { schoolEmail, schoolName, senderEmail } = await getEmailSettings();
    
    // 1. Guardar en Firebase
    const submissionsRef = collection(db, "submissions");

    // --- RATE LIMITING (Anti-Spam) ---
    // Verificar si este email ya envió más de 3 formularios en los últimos 10 minutos
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const q = query(
      submissionsRef, 
      where("email", "==", data.email), 
      where("created_at", ">=", tenMinutesAgo)
    );
    const recentSubmissions = await getDocs(q);

    if (recentSubmissions.size >= 3) {
      return { success: false, error: "Demasiados intentos recientes. Por favor espera unos minutos." };
    }
    
    // Creamos el objeto para guardar. TypeScript ya reconoce 'data.type'
    const dataToSave = {
      ...data,
      created_at: serverTimestamp(),
      status: data.type === "clases" ? "pendiente" : "nuevo",
    };

    const docRef = await addDoc(submissionsRef, dataToSave);

    // --- LÓGICA DE MENSAJES ---
    let adminAction = "";
    let userTitle = "";
    let userMessage = "";
    let extraFieldsHtml = ""; // Para el mail del admin

    // Sanitizamos los datos comunes para el email
    const safeFullname = escapeHtml(data.fullname);
    const safeEmail = escapeHtml(data.email);
    const safePhone = escapeHtml(data.phone);

    // Al usar el IF con data.type, TypeScript "entiende" qué campos existen adentro
    if (data.type === "clases") {
      // Aquí adentro, data es EnrollmentSubmission
      const safeInstrument = escapeHtml(data.instrument);
      if (data.role === "docente") {
        adminAction = "Nueva Postulación Docente";
        userTitle = "¡Gracias por querer sumarte al equipo!";
        userMessage = `<p>Hola ${safeFullname}, recibimos tu propuesta para las clases de <strong>${safeInstrument}</strong>.</p>`;
      } else {
        adminAction = "Nueva Inscripción de Alumno";
        userTitle = "¡Te damos la bienvenida a la Escuela!";
        userMessage = `<p>Hola ${safeFullname}, ¡qué bueno que quieras empezar <strong>${safeInstrument}</strong>!</p>`;
      }
      extraFieldsHtml = `<p><strong>Instrumento:</strong> ${safeInstrument}</p><p><strong>Rol:</strong> ${escapeHtml(data.role)}</p>`;
      
    } else {
      // Aquí adentro, data es ContactSubmission
      adminAction = "Nueva Consulta Web";
      userTitle = "Recibimos tu mensaje";
      userMessage = `<p>Hola ${safeFullname}, gracias por escribirnos. Pronto te responderemos.</p>`;
      // El mensaje puede ser largo, lo escapamos también
      extraFieldsHtml = `<p><strong>Mensaje:</strong> ${escapeHtml(data.message)}</p>`;
    }

    // 2. Mail para la ESCUELA
    await resend.emails.send({
      from: `Notificaciones-${schoolName} <${senderEmail}>`,
      to: schoolEmail, // Usar el email de la escuela obtenido de la configuración
      subject: `🔔 ${adminAction}: ${safeFullname}`,
      html: adminEmailTemplate(adminAction, `
        <p><strong>De:</strong> ${safeFullname}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Teléfono:</strong> ${safePhone}</p>
        ${extraFieldsHtml}
      `)
    });

    // 3. Mail para el USUARIO
    await resend.emails.send({
      from: `${schoolName} <${senderEmail}>`,
      to: data.email,
      subject: userTitle,
      html: userEmailTemplate(userTitle, userMessage)
    });

    return { success: true, id: docRef.id };

  } catch (error) {
    console.error("Error en submitForm:", error);
    return { success: false, error: "No se pudo procesar la solicitud." };
  }
}
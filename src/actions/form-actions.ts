"use server";

import { adminDb } from "@/lib/firebase-admin";
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
  role: z.enum(["alumno", "docente"]),
  age: z.number().optional(),
  instrument: z.string().optional(),
  level_or_experience: z.string().optional(),
  class_id: z.string().optional(),
  class_name: z.string().optional(),
  group_id: z.string().optional(),
  group_name: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "alumno" && !data.age) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La edad es requerida para alumnos",
      path: ["age"],
    });
  }
  if (data.role === "docente" && (!data.instrument || data.instrument.length < 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El instrumento es requerido para docentes",
      path: ["instrument"],
    });
  }
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
    
    // 1. Referencia a la colección usando Admin SDK
    const submissionsRef = adminDb.collection("submissions");

    // --- RATE LIMITING (Anti-Spam) ---
    // Requiere índice compuesto en Firestore: submissions(email ASC, created_at ASC)
    // Si el índice aún no existe, el fallback omite el rate limiting (no bloquea el envío)
    try {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentSubmissions = await submissionsRef
        .where("email", "==", data.email)
        .where("created_at", ">=", tenMinutesAgo)
        .get();

      if (recentSubmissions.size >= 3) {
        return { success: false, error: "Demasiados intentos recientes. Por favor espera unos minutos." };
      }
    } catch (rateLimitError: any) {
      // El índice compuesto aún no existe en Firestore — se omite el rate limiting
      // hasta que el índice esté disponible. Crear en:
      // Firebase Console → Firestore → Indexes → submissions(email, created_at)
      console.warn("Rate limiting omitido (índice pendiente):", rateLimitError.message);
    }
    
    // Creamos el objeto para guardar. TypeScript ya reconoce 'data.type'
    const dataToSave = {
      ...data,
      created_at: new Date(),
      status: data.type === "clases" ? "pendiente" : "nuevo",
    };

    const docRef = await submissionsRef.add(dataToSave);

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
      const safeInstrument = data.instrument ? escapeHtml(data.instrument) : "";
      const safeClassName = data.class_name ? escapeHtml(data.class_name) : "General";
      const safeGroupName = data.group_name ? escapeHtml(data.group_name) : "";
      const safeAge = data.age ? String(data.age) : "";

      if (data.role === "docente") {
        adminAction = "Nueva Postulación Docente";
        userTitle = "¡Gracias por querer sumarte al equipo!";
        userMessage = `
          <p>Hola <b>${safeFullname}</b>, recibimos tu propuesta para las clases de <strong>${safeInstrument}</strong>.</p>
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;"><b>Detalles de la postulación:</b></p>
            <p style="margin: 5px 0 0; font-size: 14px; color: #b45309;">
              Instrumento: ${safeInstrument}<br>
              Interés en: ${safeClassName}
            </p>
          </div>
          <p style="margin-top: 25px;">Revisaremos tu perfil y te escribiremos pronto para coordinar una reunión.</p>
        `;
      } else {
        adminAction = "Nueva Inscripción de Alumno";
        userTitle = "¡Te damos la bienvenida a la Escuela!";
        userMessage = `
          <p>Hola <b>${safeFullname}</b>, ¡qué bueno que quieras empezar tus clases!</p>
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-top: 20px; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #065f46;"><b>Resumen de tu inscripción:</b></p>
            <p style="margin: 5px 0 0; font-size: 14px; color: #047857;">
              <b>Clase:</b> ${safeClassName}<br>
              ${safeGroupName ? `<b>Comisión:</b> ${safeGroupName}<br>` : ""}
              ${safeAge ? `<b>Edad:</b> ${safeAge} años<br>` : ""}
            </p>
          </div>
          <p style="margin-top: 25px;">Nuestro equipo revisará las vacantes y te contactará a la brevedad para confirmar tu lugar y los próximos pasos.</p>
        `;
      }
      extraFieldsHtml = `
        <p><strong>Clase:</strong> ${safeClassName}</p>
        ${safeGroupName ? `<p><strong>Comisión:</strong> ${safeGroupName}</p>` : ""}
        ${safeAge ? `<p><strong>Edad:</strong> ${safeAge} años</p>` : ""}
        ${safeInstrument ? `<p><strong>Instrumento:</strong> ${safeInstrument}</p>` : ""}
        <p><strong>Rol:</strong> ${escapeHtml(data.role)}</p>
        ${data.level_or_experience ? `<p><strong>Nivel/Exp:</strong> ${escapeHtml(data.level_or_experience)}</p>` : ""}
      `;
      
    } else {
      // Aquí adentro, data es ContactSubmission
      adminAction = "Nueva Consulta Web";
      userTitle = "Recibimos tu mensaje";
      userMessage = `
        <p>Hola <b>${safeFullname}</b>, gracias por escribirnos.</p>
        <p>Hemos recibido tu consulta y un integrante de la Escuela te responderá en las próximas horas.</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin-top: 20px; border-radius: 8px; font-style: italic; color: #64748b;">
          "${escapeHtml(data.message)}"
        </div>
      `;
      extraFieldsHtml = `<p><strong>Mensaje:</strong> ${escapeHtml(data.message)}</p>`;
    }

    // 2. Mail para la ESCUELA (Admin)
    // Enviamos a ambos mails solicitados
    const adminRecipients = [schoolEmail, "tpcagencia@gmail.com"];
    
    await resend.emails.send({
      from: `Notificaciones-${schoolName} <${senderEmail}>`,
      to: adminRecipients,
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
// src/actions/form-actions.ts
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ContactSubmission, EnrollmentSubmission } from "@/types";
import { resend, getEmailSettings, adminEmailTemplate, userEmailTemplate } from "@/lib/resend";

type FormSubmission = ContactSubmission | EnrollmentSubmission;

export async function submitForm(data: FormSubmission) {
  try {
    // Obtenemos la configuración dinámica (incluyendo el senderEmail oficial)
    const { schoolEmail, schoolName, senderEmail } = await getEmailSettings();
    
    // 1. Guardar en Firebase
    const submissionsRef = collection(db, "submissions");
    const dataToSave = {
      ...data,
      created_at: serverTimestamp(),
      // Status inicial según el tipo de formulario
      status: data.type === "clases" ? "pendiente" : "nuevo",
    };

    const docRef = await addDoc(submissionsRef, dataToSave);

    // --- LÓGICA DE MENSAJES PERSONALIZADOS ---
    let adminAction = "";
    let userTitle = "";
    let userMessage = "";

    if (data.type === "clases") {
      if (data.role === "docente") {
        adminAction = "Nueva Postulación Docente";
        userTitle = "¡Gracias por querer sumarte al equipo!";
        userMessage = `<p>Hola ${data.fullname}, recibimos tu propuesta para las clases de <strong>${data.instrument}</strong>.</p>
                       <p>Nuestro equipo de coordinación revisará tu perfil y experiencia para ponernos en contacto con vos.</p>`;
      } else {
        adminAction = "Nueva Inscripción de Alumno";
        userTitle = "¡Te damos la bienvenida a la Escuela!";
        userMessage = `<p>Hola ${data.fullname}, ¡qué bueno que quieras empezar <strong>${data.instrument}</strong>!</p>
                       <p>Recibimos tu inscripción correctamente. En breve te contactaremos para confirmar horarios y disponibilidad.</p>`;
      }
    } else {
      adminAction = "Nueva Consulta Web";
      userTitle = "Recibimos tu mensaje";
      userMessage = `<p>Hola ${data.fullname}, gracias por escribirnos.</p>
                     <p>Hemos recibido tu consulta y te responderemos lo antes posible.</p>`;
    }

    // 2. Mail para la ESCUELA (Aviso de actividad para el Admin)
    await resend.emails.send({
      from: `Notificaciones-${schoolName} <${senderEmail}>`,
      to: 'tpcagencia@gmail.com', //schoolEmail,
      subject: `🔔 ${adminAction}: ${data.fullname}`,
      html: adminEmailTemplate(adminAction, `
        <p><strong>De:</strong> ${data.fullname}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Teléfono:</strong> ${data.phone}</p>
        ${data.type === 'clases' 
          ? `<p><strong>Instrumento:</strong> ${data.instrument}</p><p><strong>Rol:</strong> ${data.role}</p>` 
          : `<p><strong>Mensaje:</strong> ${data.message}</p>`
        }
      `)
    });

    // 3. Mail para el USUARIO (Confirmación personalizada)
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
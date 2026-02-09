"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FormSubmission } from "@/types"; // Importamos el tipo unión
import { resend, getEmailSettings, adminEmailTemplate, userEmailTemplate } from "@/lib/resend";

export async function submitForm(data: FormSubmission) {
  try {
    const { schoolEmail, schoolName, senderEmail } = await getEmailSettings();
    
    // 1. Guardar en Firebase
    const submissionsRef = collection(db, "submissions");
    
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

    // Al usar el IF con data.type, TypeScript "entiende" qué campos existen adentro
    if (data.type === "clases") {
      // Aquí adentro, data es EnrollmentSubmission
      if (data.role === "docente") {
        adminAction = "Nueva Postulación Docente";
        userTitle = "¡Gracias por querer sumarte al equipo!";
        userMessage = `<p>Hola ${data.fullname}, recibimos tu propuesta para las clases de <strong>${data.instrument}</strong>.</p>`;
      } else {
        adminAction = "Nueva Inscripción de Alumno";
        userTitle = "¡Te damos la bienvenida a la Escuela!";
        userMessage = `<p>Hola ${data.fullname}, ¡qué bueno que quieras empezar <strong>${data.instrument}</strong>!</p>`;
      }
      extraFieldsHtml = `<p><strong>Instrumento:</strong> ${data.instrument}</p><p><strong>Rol:</strong> ${data.role}</p>`;
      
    } else {
      // Aquí adentro, data es ContactSubmission
      adminAction = "Nueva Consulta Web";
      userTitle = "Recibimos tu mensaje";
      userMessage = `<p>Hola ${data.fullname}, gracias por escribirnos. Pronto te responderemos.</p>`;
      extraFieldsHtml = `<p><strong>Mensaje:</strong> ${data.message}</p>`;
    }

    // 2. Mail para la ESCUELA
    await resend.emails.send({
      from: `Notificaciones-${schoolName} <${senderEmail}>`,
      to: 'tpcagencia@gmail.com',
      subject: `🔔 ${adminAction}: ${data.fullname}`,
      html: adminEmailTemplate(adminAction, `
        <p><strong>De:</strong> ${data.fullname}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Teléfono:</strong> ${data.phone}</p>
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
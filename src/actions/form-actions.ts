// src/actions/form-actions.ts
"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ContactSubmission, EnrollmentSubmission } from "@/types";

// Definimos un tipo que sea uno o el otro
type FormSubmission = ContactSubmission | EnrollmentSubmission;

export async function submitForm(data: FormSubmission) {
  try {
    const submissionsRef = collection(db, "submissions");

    // Preparamos el objeto final usando el tipo
    const dataToSave = {
      ...data,
      created_at: serverTimestamp(),
      // El status ya lo definimos por defecto según el tipo
      status: data.type === "clases" ? "pendiente" : "nuevo",
    };

    const docRef = await addDoc(submissionsRef, dataToSave);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
    return { success: false, error: "No se pudo enviar el formulario." };
  }
}
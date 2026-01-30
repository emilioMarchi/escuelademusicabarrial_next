"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PageContent } from "@/types";

/**
 * Guarda o actualiza una página usando privilegios de Admin.
 * Bypass de reglas de seguridad de Firestore.
 */
export const savePageConfigAdmin = async (slug: string, data: Partial<PageContent>) => {
  try {
    const docRef = adminDb.collection("pages").doc(slug);
    await docRef.set({
      ...data,
      slug,
      last_updated: new Date(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error en admin.service:", error);
    return { success: false, error: "No se pudo guardar la página" };
  }
};
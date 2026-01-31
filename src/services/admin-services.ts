// src/services/admin-services.ts
"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PageContent, SectionData } from "@/types";

/**
 * Guarda o actualiza una página usando privilegios de Admin.
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
    console.error("Error en savePageConfigAdmin:", error);
    return { success: false, error: "No se pudo guardar la página" };
  }
};

/**
 * Resube las secciones con el tipado correcto de SectionData
 */
export const seedSectionsAdmin = async () => {
  try {
    // Definimos los objetos siguiendo estrictamente la interfaz SectionData
    const sections: SectionData[] = [
      {
        id: "hero",
        type: "hero",
        is_active: true,
        content: {
          title: "Escuela de Música Barrial",
          subtitle: "Cultura y música en el corazón del barrio.",
          slides: [] // Estructura requerida por la interfaz
        }
      },
      {
        id: "noticias",
        type: "noticias",
        is_active: true,
        content: {
          title: "Últimas Novedades",
        },
        settings: {
          layout: "grid" // Para que SectionRenderer sepa cómo dibujarlo
        }
      },
      {
        id: "contacto",
        type: "contacto",
        is_active: true,
        content: {
          title: "Contactanos",
          description: "Dejanos tu consulta y te responderemos a la brevedad."
        }
      }
    ];

    const batch = adminDb.batch();

    sections.forEach((section) => {
      const docRef = adminDb.collection("sections").doc(section.id);
      // Usamos set sin merge para asegurar que limpie la estructura vieja "mala"
      batch.set(docRef, {
        ...section,
        last_updated: new Date(),
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error en seedSectionsAdmin:", error);
    return { success: false, error: "No se pudieron corregir las secciones" };
  }
};
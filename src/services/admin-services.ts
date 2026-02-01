// src/services/admin-services.ts
"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PageContent, SectionData } from "@/types";
import { Class, News } from "@/types";
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
      },
      {
          id: "clases", // El ID que pusiste en el array de la página
          type: "clases",
          is_active: true,
          content: {
            title: "Nuestros Talleres",
          },
          settings: {
            layout: "slider"
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


export const seedClassesAdmin = async () => {
  try {
    const classes: Class[] = [
      {
        id: "guitarra-inicial",
        category: 'clases',
        name: "Guitarra Eléctrica",
        teacher_name: "Carlos Santana",
        schedule: "Lunes y Miércoles 18:00hs",
        description: "Aprende las bases del rock y el blues desde cero.",
        instrument: "Guitarra",
        image_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=500",
        image_alt: "Clase de guitarra",
        max_capacity: 10,
        is_active: true
      },
      {
        id: "percusion-barrial",
        category: 'clases',
        name: "Ensamble de Percusión",
        teacher_name: "Mariana Enríquez",
        schedule: "Sábados 11:00hs",
        description: "Ritmos latinoamericanos en grupo. No hace falta experiencia.",
        instrument: "Percusión",
        image_url: "https://images.unsplash.com/photo-1524230659192-35f3458f4f70?q=80&w=500",
        image_alt: "Tambores de percusión",
        max_capacity: 15,
        is_active: true
      }
    ];

    const batch = adminDb.batch();
    classes.forEach((c) => {
      const docRef = adminDb.collection("clases").doc(c.id);
      batch.set(docRef, { ...c, last_updated: new Date() });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Carga noticias de prueba en la colección 'noticias'
 */
export const seedNewsAdmin = async () => {
  try {
    const news: News[] = [
      {
        id: "festival-barrio-2026",
        category: 'noticias',
        title: "Gran Festival de Invierno",
        excerpt: "Se viene el cierre de semestre con todas las orquestas en la plaza.",
        content: "Cuerpo completo de la noticia sobre el festival...",
        date: new Date(),
        image_url: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=500",
        image_alt: "Escenario de festival",
        is_active: true
      }
    ];

    const batch = adminDb.batch();
    news.forEach((n) => {
      const docRef = adminDb.collection("noticias").doc(n.id);
      batch.set(docRef, { ...n });
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
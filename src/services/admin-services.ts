"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PageContent } from "@/types";
import { revalidatePath } from "next/cache";

// Helper para convertir Timestamps de Firebase a Strings (evita errores en Client Components)
const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value && typeof value === 'object' && '_seconds' in value) {
      return new Date(value._seconds * 1000).toISOString();
    }
    return value;
  }));
};

/** ==============================================================================
 * GESTIÓN DE PÁGINAS (ESTRUCTURA Y SECCIONES)
 * ============================================================================== */

export const getPageAdmin = async (slug: string) => {
  try {
    const doc = await adminDb.collection("pages").doc(slug).get();
    if (!doc.exists) return { success: false, error: "No existe la página" };
    return { success: true, data: serializeData({ ...doc.data(), id: doc.id }) as PageContent };
  } catch (error) { return { success: false, error }; }
};

export const savePageConfigAdmin = async (slug: string, data: Partial<PageContent>) => {
  try {
    await adminDb.collection("pages").doc(slug).set({ ...data, last_updated: new Date() }, { merge: true });
    revalidatePath(`/${slug}`);
    revalidatePath(`/`);
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

/** ==============================================================================
 * GESTIÓN DE COLECCIONES (CLASES, NOTICIAS)
 * ============================================================================== */

export const getCollectionAdmin = async (col: "clases" | "noticias") => {
  try {
    const snapshot = await adminDb.collection(col).get();
    const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: serializeData(rawData) };
  } catch (error) { return { success: false, error }; }
};

export const upsertItemAdmin = async (col: "clases" | "noticias", item: any) => {
  try {
    const { id, ...rest } = item;
    const docRef = id ? adminDb.collection(col).doc(id) : adminDb.collection(col).doc();
    await docRef.set({ ...rest, last_updated: new Date() }, { merge: true });
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const deleteItemAdmin = async (col: "clases" | "noticias", id: string) => {
  try {
    await adminDb.collection(col).doc(id).delete();
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

/** ==============================================================================
 * GESTIÓN DE AJUSTES GLOBALES (INSTRUMENTOS Y PROFESORES)
 * ============================================================================== */

// --- INSTRUMENTOS ---
export const getInstrumentsAdmin = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("instruments").get();
    return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
  } catch (error) { return { success: false, error }; }
};

export const updateInstrumentsAdmin = async (newList: string[]) => {
  try {
    await adminDb.collection("settings").doc("instruments").set({ list: newList, last_updated: new Date() });
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

// --- PROFESORES ---
export const getTeachersAdmin = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("teachers").get();
    return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
  } catch (error) { return { success: false, error }; }
};

export const updateTeachersAdmin = async (newList: string[]) => {
  try {
    await adminDb.collection("settings").doc("teachers").set({ list: newList, last_updated: new Date() });
    return { success: true };
  } catch (error) { return { success: false, error }; }
};


/** ==============================================================================
 * SEEDS (INICIALIZACIÓN DE DATOS)
 * ============================================================================== */

export const seedInstrumentsAdmin = async () => {
  try {
    const list = ["Piano", "Guitarra", "Batería", "Violín", "Canto", "Bajo"];
    await adminDb.collection("settings").doc("instruments").set({ list });
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedTeachersAdmin = async () => {
  try {
    const list = ["Prof. García", "Prof. Pérez", "Prof. López", "Prof. Rodríguez"];
    await adminDb.collection("settings").doc("teachers").set({ list });
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedClassesAdmin = async () => {
  try {
    const classes = [
      { name: "Piano Inicial", teacher_name: "Prof. García", instrument: "Piano", is_active: true, category: "clases", image_url: "", schedule: "Lunes 18hs" }
    ];
    for (const c of classes) { await adminDb.collection("clases").add(c); }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedNewsAdmin = async () => {
  try {
    const news = [{ title: "Apertura 2026", date: new Date().toISOString(), is_active: true, category: "noticias", description: "Inscripciones abiertas" }];
    for (const n of news) { await adminDb.collection("noticias").add(n); }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

// Función Legacy (se mantiene para compatibilidad)
export const seedSectionsAdmin = async () => {
  return { success: true }; 
};

/**
 * SEED PRINCIPAL: Restaura la estructura completa de la página de INICIO.
 * Incluye: Header independiente + Hero con Subtítulos y Botones dentro de Slides + Grid de Clases.
 */
export const seedAllPagesProfessional = async () => {
  try {
    const pages = [
      {
        slug: "inicio",
        category: "inicio",
        meta_title: "Escuela de Música del Barrio",
        meta_description: "Aprende música en comunidad.",
        sections: [
          // BORRAMOS EL HEADER DE ACÁ. LA HOME ARRANCA CON EL HERO.
          
          // 1. HERO (Slider Promocional)
          {
            id: "hero-slider",
            type: "hero",
            content: { 
              title: "Inscripciones Abiertas", 
              subtitle: "Formate con los mejores profesores del país.", 
              slides: [
                {
                  image_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200",
                  title: "Clases de Verano",
                  description: "Aprovecha enero y febrero.",
                  buttons: [
                    { text: "Ver Horarios", link: "/clases", style: "solid" },
                    { text: "Contacto", link: "/contacto", style: "outline" }
                  ]
                }
              ]
            },
            settings: { layout: 'slider' }
          },
          // 2. CLASES
          {
            id: "clases-grid",
            type: "clases",
            content: { title: "Nuestros Talleres" },
            settings: { layout: 'grid' }
          },
          // 3. CONTACTO
          {
            id: "contacto-home",
            type: "contacto",
            content: { 
              title: "¿Tienes dudas?", 
              description: "Escríbenos y te responderemos a la brevedad." 
            },
            settings: { form_type: 'general' }
          }
        ]
      }
    ];
    
    for (const page of pages) {
      await adminDb.collection("pages").doc(page.slug).set(page, { merge: true });
    }
    
    revalidatePath("/dashboard/inicio");
    return { success: true };
  } catch (error) { return { success: false, error }; }
};
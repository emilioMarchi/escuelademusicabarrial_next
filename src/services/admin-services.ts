"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PageContent, SectionData, Class, News } from "@/types";
import { revalidatePath } from "next/cache";

// Función para convertir Timestamps de Firebase en strings ISO legibles por el cliente
const serializeData = (data: any) => {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (value && typeof value === 'object' && '_seconds' in value) {
      return new Date(value._seconds * 1000).toISOString();
    }
    return value;
  }));
};

/** --- GESTIÓN DE PÁGINAS --- **/

export const getPageAdmin = async (slug: string) => {
  try {
    const doc = await adminDb.collection("pages").doc(slug).get();
    if (!doc.exists) return { success: false, error: "No existe la página" };
    const data = doc.data();
    return { 
      success: true, 
      data: serializeData({ ...data, id: doc.id }) as PageContent 
    };
  } catch (error) { 
    return { success: false, error }; 
  }
};

export const savePageConfigAdmin = async (slug: string, data: Partial<PageContent>) => {
  try {
    await adminDb.collection("pages").doc(slug).set({
      ...data,
      last_updated: new Date(),
    }, { merge: true });

    revalidatePath(`/${slug}`);
    revalidatePath(`/`);

    return { success: true };
  } catch (error) { 
    return { success: false, error }; 
  }
};

/** --- GESTIÓN DE COLECCIONES (CLASES/NOTICIAS) --- **/

export const getCollectionAdmin = async (col: "clases" | "noticias") => {
  try {
    const snapshot = await adminDb.collection(col).get();
    const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: serializeData(rawData) };
  } catch (error) {
    return { success: false, error };
  }
};

export const upsertItemAdmin = async (col: "clases" | "noticias", item: any) => {
  try {
    const { id, ...rest } = item;
    const docRef = id 
      ? adminDb.collection(col).doc(id) 
      : adminDb.collection(col).doc();

    await docRef.set({
      ...rest,
      last_updated: new Date()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const deleteItemAdmin = async (col: "clases" | "noticias", id: string) => {
  try {
    await adminDb.collection(col).doc(id).delete();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

/** --- FUNCIONES DE SINCRONIZACIÓN (SEED) --- **/

export const seedSectionsAdmin = async () => {
  try {
    const sections = [
      { id: "hero-home", type: "hero", content: { title: "Cultura en el Barrio", subtitle: "Música y comunidad." } },
      { id: "grid-clases", type: "clases", content: { title: "Nuestras Clases" }, settings: { layout: 'grid' } }
    ];
    for (const section of sections) {
      await adminDb.collection("sections").doc(section.id).set(section);
    }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedClassesAdmin = async () => {
  try {
    const classes = [
      { name: "Piano", teacher_name: "García", instrument: "Piano", is_active: true },
      { name: "Guitarra", teacher_name: "Pérez", instrument: "Guitarra", is_active: true }
    ];
    for (const c of classes) {
      await adminDb.collection("clases").add(c);
    }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedNewsAdmin = async () => {
  try {
    const news = [{ title: "Gran Concierto", date: "2026-05-20", is_active: true }];
    for (const n of news) {
      await adminDb.collection("noticias").add(n);
    }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedAllPagesProfessional = async () => {
  const pages = [
    { slug: "inicio", category: "inicio", meta_title: "Escuela de Música", sections: ["hero-home", "grid-clases"] },
    { slug: "nosotros", category: "nosotros", meta_title: "Sobre Nosotros", sections: [] }
  ];
  try {
    for (const page of pages) {
      await adminDb.collection("pages").doc(page.slug).set(page, { merge: true });
    }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};
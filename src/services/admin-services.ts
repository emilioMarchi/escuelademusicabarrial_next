"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PageContent, SectionData, Class, News } from "@/types";
import { revalidatePath } from "next/cache";

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
  } catch (error) { return { success: false, error }; }
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
  } catch (error) { return { success: false, error }; }
};

/** --- GESTIÓN DE COLECCIONES --- **/

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

/** --- GESTIÓN DE INSTRUMENTOS --- **/

export const getInstrumentsAdmin = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("instruments").get();
    return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
  } catch (error) { return { success: false, error }; }
};

export const updateInstrumentsAdmin = async (newList: string[]) => {
  try {
    await adminDb.collection("settings").doc("instruments").set({
      list: newList,
      last_updated: new Date()
    });
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

/** --- FUNCIONES SEED (CORREGIDAS Y COMPLETAS) --- **/

export const seedInstrumentsAdmin = async () => {
  try {
    const list = ["Piano", "Guitarra", "Batería", "Violín", "Canto", "Bajo"];
    await adminDb.collection("settings").doc("instruments").set({ list, last_updated: new Date() });
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedSectionsAdmin = async () => {
  try {
    const sections = [
      { 
        id: "hero-inicio-main", 
        type: "hero", 
        content: { 
          slides: [
            {
              image_url: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200",
              image_alt: "Orquesta en vivo",
              title: "Escuela de Música del Barrio",
              description: "Un espacio para aprender y compartir cultura."
            }
          ]
        } 
      }
    ];
    for (const section of sections) {
      await adminDb.collection("sections").doc(section.id).set(section, { merge: true });
    }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedClassesAdmin = async () => {
  try {
    const classes = [
      { name: "Piano Inicial", teacher_name: "Prof. García", instrument: "Piano", is_active: true, category: "clases" }
    ];
    for (const c of classes) { await adminDb.collection("clases").add(c); }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedNewsAdmin = async () => {
  try {
    const news = [{ title: "Apertura 2026", date: new Date().toISOString(), is_active: true, category: "noticias" }];
    for (const n of news) { await adminDb.collection("noticias").add(n); }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};

export const seedAllPagesProfessional = async () => {
  try {
    const pages = [
      {
        slug: "inicio",
        category: "inicio",
        meta_title: "Escuela de Música | Inicio",
        meta_description: "Educación musical para todos.",
        sections: [
          {
            id: "hero-home",
            type: "hero",
            content: { 
              slides: [
                {
                  image_url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=1200",
                  image_alt: "Concierto",
                  title: "Música que Une",
                  description: "Sumate a la orquesta del barrio."
                }
              ]
            },
            settings: { layout: 'slider' }
          },
          {
            id: "clases-grid",
            type: "clases",
            content: { title: "Nuestras Clases", description: "Encontrá tu instrumento." },
            settings: { layout: 'grid' }
          }
        ]
      }
    ];
    for (const page of pages) {
      await adminDb.collection("pages").doc(page.slug).set(page, { merge: true });
    }
    return { success: true };
  } catch (error) { return { success: false, error }; }
};
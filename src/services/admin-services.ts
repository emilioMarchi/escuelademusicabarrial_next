// src/services/admin-services.ts
"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PageContent, Donation, Class, News } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * UTILS: Serialización de datos
 * Convierte Timestamps de Firebase a Strings ISO para que Next.js
 * pueda pasarlos de Server a Client Components sin errores.
 */
const serializeData = (data: any) => {
  if (!data) return data;
  const serialized = { ...data };
  Object.keys(data).forEach((key) => {
    if (data[key] && typeof data[key].toDate === "function") {
      serialized[key] = data[key].toDate().toISOString();
    } else if (Array.isArray(data[key])) {
      serialized[key] = data[key].map((item: any) => serializeData(item));
    } else if (typeof data[key] === "object" && data[key] !== null) {
      serialized[key] = serializeData(data[key]);
    }
  });
  return serialized;
};

// --- GESTIÓN DE PÁGINAS ---

export const getPageAdmin = async (slug: string) => {
  try {
    const snapshot = await adminDb
      .collection("pages")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return { success: false, error: "Página no encontrada" };

    const doc = snapshot.docs[0];
    return {
      success: true,
      data: { id: doc.id, ...serializeData(doc.data()) } as PageContent,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const savePageConfigAdmin = async (slug: string, data: any) => {
  try {
    const snapshot = await adminDb
      .collection("pages")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) throw new Error("Página no encontrada");

    const docId = snapshot.docs[0].id;
    await adminDb.collection("pages").doc(docId).update({
      ...data,
      last_updated: new Date(),
    });

    revalidatePath(`/dashboard/paginas/${slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE COLECCIONES (CLASES, NOTICIAS) ---

export const getCollectionAdmin = async (collectionName: string) => {
  try {
    const snapshot = await adminDb
      .collection(collectionName)
      .orderBy("last_updated", "desc")
      .get();
    
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...serializeData(doc.data()),
    }));
    return { success: true, data };
  } catch (error) {
    // Si falla el orderBy (porque no hay registros), traemos todo sin orden
    const snapshot = await adminDb.collection(collectionName).get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...serializeData(doc.data()),
    }));
    return { success: true, data };
  }
};

export const upsertItemAdmin = async (collectionName: string, item: any) => {
  try {
    const { id, ...rest } = item;
    const dataToSave = { ...rest, last_updated: new Date() };

    if (id) {
      await adminDb.collection(collectionName).doc(id).set(dataToSave, { merge: true });
    } else {
      await adminDb.collection(collectionName).add(dataToSave);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteItemAdmin = async (collectionName: string, id: string) => {
  try {
    await adminDb.collection(collectionName).doc(id).delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- AUDITORÍA DE PAGOS (DONACIONES) ---

export const getDonationsAdmin = async () => {
  try {
    const snapshot = await adminDb
      .collection("donations")
      .orderBy("created_at", "desc")
      .get();

    const donations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...serializeData(doc.data()),
    })) as Donation[];

    return { success: true, data: donations };
  } catch (error) {
    console.error("Error fetching donations:", error);
    return { success: false, error: String(error) };
  }
};

// --- AJUSTES GLOBALES Y LISTAS ---

export const getGlobalSettingsAdmin = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("general").get();
    if (!doc.exists) return { success: true, data: {} };
    return { success: true, data: serializeData(doc.data()) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateGlobalSettingsAdmin = async (data: any) => {
  try {
    await adminDb.collection("settings").doc("general").set({
      ...data,
      last_updated: new Date(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const getInstrumentsAdmin = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("instruments").get();
    return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateInstrumentsAdmin = async (list: string[]) => {
  try {
    await adminDb.collection("settings").doc("instruments").set({ list });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const getTeachersAdmin = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("teachers").get();
    return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateTeachersAdmin = async (list: string[]) => {
  try {
    await adminDb.collection("settings").doc("teachers").set({ list });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteDonationAdmin = async (id: string) => {
  try {
    await adminDb.collection("donations").doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar donación:", error);
    return { success: false, error: String(error) };
  }
};
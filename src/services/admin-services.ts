// src/services/admin-services.ts
"use server";

import { adminDb } from "@/lib/firebase-admin";
import { PageContent, Donation, Class, News, GalleryImage } from "@/types";
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




export const deleteImageFromGalleryAdmin = async (id: string) => {
  try {
    await adminDb.collection("gallery").doc(id).delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// Agregar esto a tu archivo admin-services.ts existente

/**
 * SUBIDA DE IMAGEN A STORAGE (ADMIN)
 */
export const uploadFileAdmin = async (formData: FormData) => {
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No se proporcionó ningún archivo");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Usamos el bucket configurado en tu firebase-admin
    const bucket = adminStorage.bucket();
    const fileName = `gallery/${Date.now()}-${file.name}`;
    const fileRef = bucket.file(fileName);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    // Hacemos el archivo público para obtener la URL directa
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return { success: true, url: publicUrl };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};


export const getGalleryImages = async (): Promise<GalleryResult> => {
  try {
    const snapshot = await adminDb
      .collection("gallery")
      .orderBy("created_at", "desc")
      .get();

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...serializeData(doc.data())
    }));

    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * GUARDAR EN FIRESTORE
 */
export const addImageToGalleryAdmin = async (imageData: any) => {
  try {
    const docRef = await adminDb.collection("gallery").add({
      ...imageData,
      created_at: new Date().toISOString()
    });
    revalidatePath("/galeria");
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// Agregar esto a tu archivo admin-services.ts

import { adminStorage } from "@/lib/firebase-admin"; // Asegúrate de exportar admin.storage() como adminStorage

type GalleryResult = 
  | { success: true; data: any[] } 
  | { success: false; error: string };

/**
 * OBTENER IMÁGENES (ADMIN)
 */
export const getGalleryImagesAdmin = async () => {
  try {
    const snapshot = await adminDb
      .collection("gallery")
      .orderBy("order", "asc") // Usamos el orden manual del dashboard
      .get();
    
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...serializeData(doc.data()),
    }));
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching gallery:", error);
    // Fallback por si falla el orderBy (si no hay registros o índices)
    const snapshot = await adminDb.collection("gallery").get();
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...serializeData(doc.data()),
    }));
    return { success: true, data };
  }
};

/**
 * SUBIR ARCHIVO Y GUARDAR EN FIRESTORE (ADMIN)
 */
// src/services/admin-services.ts
export const uploadAndAddImageAdmin = async (formData: FormData) => {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) throw new Error("Archivo vacío");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // USAMOS EL NOMBRE EXACTO QUE ME PASASTE
    const bucket = adminStorage.bucket("escuelita-db.firebasestorage.app");
    
    const path = `galeria/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const fileRef = bucket.file(path);

    // SUBIDA
    await fileRef.save(buffer, {
      metadata: { contentType: file.type }
    });

    // HACER PÚBLICO
    await fileRef.makePublic();
    
    const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

    // GUARDAR EN FIRESTORE
    await adminDb.collection("gallery").add({
      url,
      caption: formData.get("caption") || "",
      order: 0,
      created_at: new Date().toISOString()
    });

    revalidatePath("/galeria");
    revalidatePath("/dashboard/galeria");

    return { success: true };
  } catch (error) {
    console.error("DEBUG STORAGE ERROR:", error);
    return { success: false, error: String(error) };
  }
};
/**
 * ELIMINAR IMAGEN
 */
export const deleteImageAdmin = async (id: string, url: string) => {
  try {
    // 1. Borrar de Firestore
    await adminDb.collection("gallery").doc(id).delete();
    
    // 2. Intentar borrar de Storage (opcional pero recomendado)
    try {
      const fileName = url.split("/").pop()?.split("?")[0];
      if (fileName) {
        await adminStorage.bucket().file(`galeria/${fileName}`).delete();
      }
    } catch (e) { console.error("No se pudo borrar el archivo físico:", e); }

    revalidatePath("/galeria");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * ACTUALIZAR ORDEN
 */
export const updateImageOrderAdmin = async (images: {id: string, order: number}[]) => {
  try {
    const batch = adminDb.batch();
    images.forEach(img => {
      const ref = adminDb.collection("gallery").doc(img.id);
      batch.update(ref, { order: img.order });
    });
    await batch.commit();
    revalidatePath("/galeria");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
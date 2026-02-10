// src/services/admin-services.ts
"use server";

import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { PageContent, Donation, GalleryImage, GalleryVideo } from "@/types";
import { revalidatePath } from "next/cache";

/**
 * UTILS: Serialización de datos
 * Convierte Timestamps de Firebase a Strings ISO para Next.js
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

// --- GESTIÓN DE PÁGINAS (CONTENIDOS DINÁMICOS) ---

export const getPageAdmin = async (slug: string) => {
  try {
    const snapshot = await adminDb.collection("pages").where("slug", "==", slug).limit(1).get();
    if (snapshot.empty) return { success: false, error: "Página no encontrada" };
    const doc = snapshot.docs[0];
    return { success: true, data: { id: doc.id, ...serializeData(doc.data()) } as PageContent };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const savePageConfigAdmin = async (slug: string, data: any) => {
  try {
    const snapshot = await adminDb.collection("pages").where("slug", "==", slug).limit(1).get();
    if (snapshot.empty) throw new Error("Página no encontrada");
    const docId = snapshot.docs[0].id;
    await adminDb.collection("pages").doc(docId).update({ ...data, last_updated: new Date() });
    
    // Revalidamos para que el cambio se vea en el sitio público
    revalidatePath(`/dashboard/${slug}`);
    revalidatePath(`/${slug}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE COLECCIONES GENÉRICAS (CLASES, NOTICIAS) ---

export const getCollectionAdmin = async (collectionName: string) => {
  try {
    const snapshot = await adminDb.collection(collectionName).orderBy("last_updated", "desc").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data };
  } catch (error) {
    const snapshot = await adminDb.collection(collectionName).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) }));
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
    revalidatePath("/");
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

// --- GESTIÓN DE GALERÍA ---

export const getGalleryImagesAdmin = async () => {
  try {
    const snapshot = await adminDb.collection("gallery").orderBy("order", "asc").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data };
  } catch (error) {
    const snapshot = await adminDb.collection("gallery").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data };
  }
};

export const uploadAndAddImageAdmin = async (formData: FormData) => {
  try {
    const file = formData.get("file") as File;
    const bucket = adminStorage.bucket("escuelita-db.firebasestorage.app");
    const path = `galeria/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const fileRef = bucket.file(path);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fileRef.save(buffer, { metadata: { contentType: file.type } });
    await fileRef.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

    await adminDb.collection("gallery").add({
      url,
      caption: formData.get("caption") || "",
      order: 0,
      created_at: new Date().toISOString()
    });

    revalidatePath("/galeria");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteImageAdmin = async (id: string, url: string) => {
  try {
    await adminDb.collection("gallery").doc(id).delete();
    const fileName = url.split("/").pop()?.split("?")[0];
    if (fileName) {
      await adminStorage.bucket("escuelita-db.firebasestorage.app").file(`galeria/${fileName}`).delete();
    }
    revalidatePath("/galeria");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateImageOrderAdmin = async (images: {id: string, order: number, caption?: string}[]) => {
  try {
    const batch = adminDb.batch();
    images.forEach((img) => {
      const docRef = adminDb.collection("gallery").doc(img.id);
      batch.update(docRef, { order: img.order, caption: img.caption || "" });
    });
    await batch.commit();
    revalidatePath("/galeria");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- AJUSTES GLOBALES Y LISTAS (DOCENTES / INSTRUMENTOS) ---

export const getInstrumentsAdmin = async () => {
  const doc = await adminDb.collection("settings").doc("instruments").get();
  return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
};

export const updateInstrumentsAdmin = async (list: string[]) => {
  await adminDb.collection("settings").doc("instruments").set({ list });
  return { success: true };
};

export const getTeachersAdmin = async () => {
  const doc = await adminDb.collection("settings").doc("teachers").get();
  return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
};

export const updateTeachersAdmin = async (list: string[]) => {
  await adminDb.collection("settings").doc("teachers").set({ list });
  return { success: true };
};

export const getGlobalSettingsAdmin = async () => {
  const doc = await adminDb.collection("settings").doc("general").get();
  return { success: true, data: doc.exists ? serializeData(doc.data()) : {} };
};

export const updateGlobalSettingsAdmin = async (data: any) => {
  await adminDb.collection("settings").doc("general").set({ ...data, last_updated: new Date() }, { merge: true });
  return { success: true };
};

// --- AUDITORÍA DE PAGOS ---

export const getDonationsAdmin = async () => {
  try {
    const snapshot = await adminDb.collection("donations").orderBy("created_at", "desc").get();
    const donations = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data: donations };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteDonationAdmin = async (id: string) => {
  await adminDb.collection("donations").doc(id).delete();
  return { success: true };
};

// --- SUBIDAS ESPECÍFICAS (HEADERS) ---

export const uploadFileOnlyAdmin = async (formData: FormData) => {
  try {
    const file = formData.get("file") as File;
    const bucket = adminStorage.bucket("escuelita-db.firebasestorage.app");
    const path = `headers/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const fileRef = bucket.file(path);
    await fileRef.save(Buffer.from(await file.arrayBuffer()), { metadata: { contentType: file.type } });
    await fileRef.makePublic();
    return { success: true, url: `https://storage.googleapis.com/${bucket.name}/${path}` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};



// --- GESTIÓN DE ADMINISTRADORES ---

export const getAdminsAdmin = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("admins").get();
    return { success: true, data: doc.exists ? doc.data()?.emails || [] : [] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateAdminsAdmin = async (emails: string[]) => {
  try {
    await adminDb.collection("settings").doc("admins").set({ emails }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};


// --- GESTIÓN DE VIDEOS DE GALERÍA ---

export const getGalleryVideosAdmin = async () => {
  try {
    const snapshot = await adminDb.collection("gallery_videos").orderBy("order", "asc").get();
    const videos = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data: videos as GalleryVideo[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const addVideoAdmin = async (video: Omit<GalleryVideo, 'id'>) => {
  try {
    const docRef = await adminDb.collection("gallery_videos").add({
      ...video,
      created_at: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteVideoAdmin = async (id: string, url: string, type: 'file' | 'link') => {
  try {
    await adminDb.collection("gallery_videos").doc(id).delete();
    // Si es un archivo, lo borramos de Storage
    if (type === 'file') {
      const bucket = adminStorage.bucket("escuelita-db.firebasestorage.app");
      const fileName = url.split('/').pop()?.split('?')[0];
      if (fileName) await bucket.file(`gallery/${fileName}`).delete();
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const addGalleryLinkAdmin = async (url: string, caption: string) => {
  try {
    await adminDb.collection("gallery").add({
      url,
      caption,
      order: 0, // Se agrega al inicio siguiendo tu lógica actual
      created_at: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
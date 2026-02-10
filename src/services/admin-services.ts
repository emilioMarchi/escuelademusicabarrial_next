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

export const getPagesAdmin = async () => {
  try {
    const snapshot = await adminDb.collection("pages").get();
    const pages = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data: pages as PageContent[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const savePageConfigAdmin = async (slug: string, data: any) => {
  try {
    await adminDb.collection("pages").doc(data.id).set(data);
    
    // REVALIDACIÓN: Limpia la página específica y el layout global
    revalidatePath(`/${slug}`);
    revalidatePath('/', 'layout'); 
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE GALERÍA ---

export const getGalleryImagesAdmin = async () => {
  try {
    const snapshot = await adminDb.collection("gallery_images").orderBy("order", "asc").get();
    const images = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data: images as GalleryImage[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const uploadAndAddImageAdmin = async (formData: FormData) => {
  try {
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string;
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = adminStorage.bucket("escuelita-db.firebasestorage.app");
    const fileName = `${Date.now()}-${file.name}`;
    const fileUpload = bucket.file(`gallery/${fileName}`);

    await fileUpload.save(buffer, { metadata: { contentType: file.type } });
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(`gallery/${fileName}`)}?alt=media`;

    await adminDb.collection("gallery_images").add({
      url: publicUrl,
      caption: caption || "",
      order: 0,
      created_at: new Date()
    });

    revalidatePath('/galeria');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteImageAdmin = async (id: string, url: string) => {
  try {
    await adminDb.collection("gallery_images").doc(id).delete();
    const bucket = adminStorage.bucket("escuelita-db.firebasestorage.app");
    const fileName = url.split('/').pop()?.split('?')[0];
    if (fileName) await bucket.file(`gallery/${fileName}`).delete();

    revalidatePath('/galeria');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateImageOrderAdmin = async (images: {id: string, order: number, caption: string}[]) => {
  try {
    const batch = adminDb.batch();
    images.forEach((img) => {
      const ref = adminDb.collection("gallery_images").doc(img.id);
      batch.update(ref, { order: img.order, caption: img.caption });
    });
    await batch.commit();

    revalidatePath('/galeria');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE DONACIONES ---

export const getDonationsAdmin = async () => {
  try {
    const snapshot = await adminDb.collection("donations").orderBy("created_at", "desc").get();
    const donations = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data: donations as Donation[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE CONFIGURACIÓN GLOBAL ---

export const getGlobalSettingsAdmin = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("general").get();
    return { success: true, data: serializeData(doc.data()) };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateGlobalSettingsAdmin = async (data: any) => {
  try {
    await adminDb.collection("settings").doc("general").set(data, { merge: true });
    
    // Al ser settings globales, revalidamos todo el layout (Navbar/Footer)
    revalidatePath('/', 'layout');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE VIDEOS Y LINKS ---

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

    revalidatePath('/galeria');
    
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteVideoAdmin = async (id: string, url: string, type: 'file' | 'link') => {
  try {
    await adminDb.collection("gallery_videos").doc(id).delete();
    if (type === 'file') {
      const bucket = adminStorage.bucket("escuelita-db.firebasestorage.app");
      const fileName = url.split('/').pop()?.split('?')[0];
      if (fileName) await bucket.file(`gallery/${fileName}`).delete();
    }

    revalidatePath('/galeria');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const addGalleryLinkAdmin = async (url: string, caption: string) => {
  try {
    await adminDb.collection("gallery_images").add({
      url,
      caption,
      order: 0,
      created_at: new Date().toISOString()
    });

    revalidatePath('/galeria');
    revalidatePath('/');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
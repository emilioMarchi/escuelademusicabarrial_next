// src/services/admin-services.ts
"use server";

import { adminDb, adminStorage, adminAuth, STORAGE_BUCKET } from "@/lib/firebase-admin";
import { PageContent, Donation, GalleryImage, GalleryVideo, SectionData } from "@/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// --- MIDDLEWARE DE SEGURIDAD (DEFINITIVO) ---
const verifyAdminAccess = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    throw new Error("Acceso denegado: No autenticado.");
  }

  try {
    // 1. Verificar la cookie de sesión con Firebase Admin SDK
    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );

    // 2. (Extra de seguridad) Verificar si el email del usuario está en la lista de admins autorizados en Firestore
    const adminDoc = await adminDb.collection("settings").doc("admins").get();
    const allowedEmails = adminDoc.data()?.emails || [];

    if (!decodedClaims.email || !allowedEmails.includes(decodedClaims.email)) {
      throw new Error("Acceso denegado: El usuario no es un administrador autorizado.");
    }

    // Si todo está bien, la acción puede continuar.
  } catch (error) {
    // La cookie es inválida, expiró o fue revocada.
    throw new Error("Acceso denegado: Sesión inválida o expirada.");
  }
};

/**
 * UTILS: Generador de Slugs
 */
const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/\s+/g, "-")           // Reemplaza espacios con -
    .replace(/[^\w-]+/g, "")       // Elimina caracteres no válidos
    .replace(/--+/g, "-")           // Elimina guiones dobles
    .trim();
};

/**
 * UTILS: Serialización de datos
 * Usa genérico <T> para preservar el tipo del objeto de entrada en la salida.
 */
const serializeData = <T extends Record<string, any>>(data: T): T => {
  if (!data) return data;
  const serialized = { ...data } as Record<string, any>;
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value && typeof value.toDate === "function") {
      serialized[key] = (value.toDate() as Date).toISOString();
    } else if (Array.isArray(value)) {
      serialized[key] = value.map((item: unknown) =>
        item && typeof item === "object" ? serializeData(item as Record<string, any>) : item
      );
    } else if (value && typeof value === "object") {
      serialized[key] = serializeData(value as Record<string, any>);
    }
  });
  return serialized as T;
};

// --- GESTIÓN DE PÁGINAS (CONTENIDOS DINÁMICOS) ---

export const getPageAdmin = async (slug: string) => {
  try {
    await verifyAdminAccess();
    const snapshot = await adminDb.collection("pages").where("slug", "==", slug).limit(1).get();
    if (snapshot.empty) return { success: false, error: "Página no encontrada" };
    const doc = snapshot.docs[0];
    return { success: true, data: { id: doc.id, ...serializeData(doc.data()) } as PageContent };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- FUNCIÓN CORREGIDA Y ROBUSTA ---
export const savePageConfigAdmin = async (slug: string, data: any) => {
  try {
    await verifyAdminAccess();
    // 1. Buscamos el documento por slug
    const snapshot = await adminDb.collection("pages").where("slug", "==", slug).limit(1).get();
    
    if (snapshot.empty) throw new Error("Página no encontrada");
    
    // Obtenemos la referencia directa al documento para actualizarlo
    const docRef = snapshot.docs[0].ref;

    // 2. SANEAMIENTO DE SECCIONES (El paso crítico)
    // Nos aseguramos de que 'settings' se guarde explícitamente, incluso si está vacío.
    // Si no hacemos esto, Firebase a veces ignora objetos vacíos o mal estructurados.
    const sectionsToSave = (data.sections || []).map((section: any) => ({
      id: section.id,
      type: section.type,
      content: section.content || {},
      settings: section.settings || {}, // <--- ESTO ES LO QUE ARREGLA EL GUARDADO DEL SWITCH
    }));

    // 3. Actualizamos la base de datos
    await docRef.update({
      ...data,
      sections: sectionsToSave,
      last_updated: new Date()
    });
    
    // 4. Limpieza de caché (Revalidación)
    // Esto fuerza a Next.js a reconstruir la página en el frontend
    revalidatePath(`/${slug}`);          // Ej: /contacto
    revalidatePath("/");                 // Home
    revalidatePath(`/dashboard/${slug}`); // Dashboard mismo
    revalidatePath("/admin/editor/[slug]", "page"); 

    return { success: true };
  } catch (error) {
    console.error("Error saving page:", error);
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE COLECCIONES GENÉRICAS (CLASES, NOTICIAS) ---

/**
 * Función PÚBLICA para obtener colecciones SIN autenticación.
 * Usada por las páginas públicas (novedades, clases) para visitantes.
 */
export const getCollectionPublic = async (collectionName: string) => {
  try {
    const snapshot = await adminDb.collection(collectionName).orderBy("last_updated", "desc").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) })) as unknown[];
    return { success: true, data };
  } catch (error) {
    // Fallback sin ordenamiento solo si falla el índice
    try {
      const snapshot = await adminDb.collection(collectionName).get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) })) as unknown[];
      return { success: true, data };
    } catch (fallbackError) {
      return { success: false, error: String(fallbackError) };
    }
  }
};

/**
 * Función ADMIN para obtener colecciones CON autenticación.
 * Usada por el panel de administración.
 */
export const getCollectionAdmin = async (collectionName: string) => {
  // Verificamos acceso ANTES de cualquier operación de DB
  await verifyAdminAccess();
  try {
    const snapshot = await adminDb.collection(collectionName).orderBy("last_updated", "desc").get();
    // Cast a unknown[] porque Firestore no conoce el tipo concreto (Class, News, etc.)
    // El llamador es responsable de hacer el cast correcto (ej: as Class[])
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) })) as unknown[];
    return { success: true, data };
  } catch (error) {
    // Fallback sin ordenamiento solo si falla el índice (error de Firestore, no de auth)
    try {
      const snapshot = await adminDb.collection(collectionName).get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) })) as unknown[];
      return { success: true, data };
    } catch (fallbackError) {
      return { success: false, error: String(fallbackError) };
    }
  }
};

export const upsertItemAdmin = async (collectionName: string, item: any) => {
  try {
    await verifyAdminAccess();
    const { id, ...rest } = item;
    
    // GENERACIÓN AUTOMÁTICA DE SLUG
    let slug = rest.slug;
    const nameOrTitle = rest.name || rest.title;
    if (nameOrTitle) {
      slug = generateSlug(nameOrTitle);
    }

    const dataToSave = { 
      ...rest, 
      slug, 
      last_updated: new Date() 
    };

    if (id) {
      await adminDb.collection(collectionName).doc(id).set(dataToSave, { merge: true });
    } else {
      await adminDb.collection(collectionName).add(dataToSave);
    }
    
    revalidatePath("/");
    revalidatePath("/clases");
    revalidatePath("/novedades");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteItemAdmin = async (collectionName: string, id: string) => {
  try {
    await verifyAdminAccess();
    await adminDb.collection(collectionName).doc(id).delete();
    revalidatePath("/");
    revalidatePath("/clases");
    revalidatePath("/novedades");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE GALERÍA ---

/**
 * Función PÚBLICA para obtener imágenes de galería SIN autenticación.
 * Usada por las páginas públicas.
 */
export const getGalleryImagesPublic = async () => {
  try {
    const snapshot = await adminDb.collection("gallery").orderBy("order", "asc").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data };
  } catch (error) {
    try {
      const snapshot = await adminDb.collection("gallery").get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
      return { success: true, data };
    } catch (fallbackError) {
      return { success: false, error: String(fallbackError) };
    }
  }
};

/**
 * Función ADMIN para obtener imágenes de galería CON autenticación.
 */
export const getGalleryImagesAdmin = async () => {
  // Verificamos acceso ANTES de cualquier operación de DB
  await verifyAdminAccess();
  try {
    const snapshot = await adminDb.collection("gallery").orderBy("order", "asc").get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data };
  } catch (error) {
    // Fallback sin ordenamiento solo si falla el índice (error de Firestore, no de auth)
    try {
      const snapshot = await adminDb.collection("gallery").get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
      return { success: true, data };
    } catch (fallbackError) {
      return { success: false, error: String(fallbackError) };
    }
  }
};

export const uploadAndAddImageAdmin = async (formData: FormData) => {
  try {
    await verifyAdminAccess();
    const file = formData.get("file") as File;
    const bucket = adminStorage.bucket(STORAGE_BUCKET);
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
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteImageAdmin = async (id: string, url: string) => {
  try {
    await verifyAdminAccess();
    await adminDb.collection("gallery").doc(id).delete();
    const fileName = url.split("/").pop()?.split("?")[0];
    if (fileName) {
      await adminStorage.bucket(STORAGE_BUCKET).file(`galeria/${fileName}`).delete();
    }
    revalidatePath("/galeria");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateImageOrderAdmin = async (images: {id: string, order: number, caption?: string}[]) => {
  try {
    await verifyAdminAccess();
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
  await verifyAdminAccess();
  const doc = await adminDb.collection("settings").doc("instruments").get();
  return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
};

export const updateInstrumentsAdmin = async (list: string[]) => {
  await verifyAdminAccess();
  await adminDb.collection("settings").doc("instruments").set({ list });
  revalidatePath("/", "layout");
  return { success: true };
};

export const getTeachersAdmin = async () => {
  await verifyAdminAccess();
  const doc = await adminDb.collection("settings").doc("teachers").get();
  return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
};

export const updateTeachersAdmin = async (list: string[]) => {
  await verifyAdminAccess();
  await adminDb.collection("settings").doc("teachers").set({ list });
  revalidatePath("/", "layout");
  return { success: true };
};

/**
 * Función PÚBLICA para obtener settings SIN autenticación.
 * Usada por las páginas públicas.
 */
export const getGlobalSettingsPublic = async () => {
  try {
    const doc = await adminDb.collection("settings").doc("general").get();
    return { success: true, data: doc.exists && doc.data() ? serializeData(doc.data()!) : {} };
  } catch (error) {
    return { success: false, error: String(error), data: {} };
  }
};

/**
 * Función ADMIN para obtener settings CON autenticación.
 * Usada por el panel de administración.
 */
export const getGlobalSettingsAdmin = async () => {
  await verifyAdminAccess();
  const doc = await adminDb.collection("settings").doc("general").get();
  return { success: true, data: doc.exists && doc.data() ? serializeData(doc.data()!) : {} };
};

export const updateGlobalSettingsAdmin = async (data: any) => {
  await verifyAdminAccess();
  await adminDb.collection("settings").doc("general").set({ ...data, last_updated: new Date() }, { merge: true });
  revalidatePath("/", "layout");
  return { success: true };
};

// --- AUDITORÍA DE PAGOS ---

export const getDonationsAdmin = async () => {
  try {
    await verifyAdminAccess();
    const snapshot = await adminDb.collection("donations").orderBy("created_at", "desc").get();
    const donations = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data: donations };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteDonationAdmin = async (id: string) => {
  await verifyAdminAccess();
  await adminDb.collection("donations").doc(id).delete();
  revalidatePath("/dashboard/balances");
  return { success: true };
};

// --- SUBIDAS ESPECÍFICAS (HEADERS) ---

export const uploadFileOnlyAdmin = async (formData: FormData) => {
  try {
    await verifyAdminAccess();
    const file = formData.get("file") as File;
    const bucket = adminStorage.bucket(STORAGE_BUCKET);
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
    await verifyAdminAccess();
    const doc = await adminDb.collection("settings").doc("admins").get();
    return { success: true, data: doc.exists ? doc.data()?.emails || [] : [] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateAdminsAdmin = async (emails: string[]) => {
  try {
    await verifyAdminAccess();
    await adminDb.collection("settings").doc("admins").set({ emails }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE VIDEOS DE GALERÍA ---

export const getGalleryVideosAdmin = async () => {
  try {
    await verifyAdminAccess();
    const snapshot = await adminDb.collection("gallery_videos").orderBy("order", "asc").get();
    const videos = snapshot.docs.map(doc => ({ id: doc.id, ...serializeData(doc.data()) }));
    return { success: true, data: videos as GalleryVideo[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const addVideoAdmin = async (video: Omit<GalleryVideo, 'id'>) => {
  try {
    await verifyAdminAccess();
    const slug = video.title ? generateSlug(video.title) : "";
    const docRef = await adminDb.collection("gallery_videos").add({
      ...video,
      slug,
      created_at: new Date()
    });
    revalidatePath("/galeria");
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteVideoAdmin = async (id: string, url: string, type: 'file' | 'link') => {
  try {
    await verifyAdminAccess();
    await adminDb.collection("gallery_videos").doc(id).delete();
    if (type === 'file') {
      const bucket = adminStorage.bucket(STORAGE_BUCKET);
      const fileName = url.split('/').pop()?.split('?')[0];
      if (fileName) await bucket.file(`gallery/${fileName}`).delete();
    }
    revalidatePath("/galeria");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const addGalleryLinkAdmin = async (url: string, caption: string) => {
  try {
    await verifyAdminAccess();
    const slug = caption ? generateSlug(caption) : "";
    await adminDb.collection("gallery").add({
      url,
      caption,
      slug,
      order: 0,
      created_at: new Date().toISOString()
    });
    revalidatePath("/galeria");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const getAdminCollectionItems = async (collectionName: string) => {
  try {
    await verifyAdminAccess();
    const snapshot = await adminDb.collection(collectionName).get();
    
    // CORRECCIÓN CRÍTICA:
    // Antes devolvía doc.data() directo (con Timestamps).
    // Ahora envolvemos todo en serializeData() para pasar los Timestamps a Strings.
    return snapshot.docs.map((doc) => serializeData({ 
      id: doc.id, 
      ...doc.data() 
    }));

  } catch (error) {
    console.error(`Error en getAdminCollectionItems para ${collectionName}:`, error);
    return [];
  }
};
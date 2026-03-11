// src/services/admin-services.ts
"use server";

import admin from "firebase-admin";
import { adminDb, adminStorage, adminAuth, STORAGE_BUCKET } from "@/lib/firebase-admin";
import { PageContent, Donation, GalleryImage, GalleryVideo, SectionData } from "@/types";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";
import { cookies } from "next/headers";

// --- MIDDLEWARE DE SEGURIDAD (DEFINITIVO) ---
const verifyAdminAccess = async () => {
  let sessionCookie: string | undefined;
  
  try {
    const cookieStore = await cookies();
    sessionCookie = cookieStore.get("session")?.value;
  } catch (e) {
    throw new Error("Error interno al leer la sesión.");
  }

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
    const sectionsToSave = (data.sections || []).map((section: any) => ({
      id: section.id,
      type: section.type,
      content: section.content || {},
      settings: section.settings || {},
    }));

    // 3. Actualizamos la base de datos
    await docRef.update({
      ...data,
      sections: sectionsToSave,
      last_updated: new Date()
    });
    
    // 4. Limpieza de caché
    (revalidateTag as any)("pages");
    (revalidatePath as any)(`/${slug}`);
    (revalidatePath as any)("/");
    (revalidatePath as any)(`/dashboard/${slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error saving page:", error);
    return { success: false, error: String(error) };
  }
};

// --- GESTIÓN DE COLECCIONES GENÉRICAS (CLASES, NOTICIAS, GRUPOS) ---

/**
 * Función PÚBLICA para obtener colecciones SIN autenticación (CON CACHE).
 */
export const getCollectionPublic = unstable_cache(
  async (collectionName: string) => {
    try {
      const snapshot = await adminDb.collection(collectionName).orderBy("last_updated", "desc").get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) })) as unknown[];
      return { success: true, data };
    } catch (error) {
      try {
        const snapshot = await adminDb.collection(collectionName).get();
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) })) as unknown[];
        return { success: true, data };
      } catch (fallbackError) {
        return { success: false, error: String(fallbackError) };
      }
    }
  },
  ["get-collection-public"],
  { revalidate: 3600, tags: ["collections"] }
);

/**
 * Función PÚBLICA específica para Grupos (SSOT) (CON CACHE).
 * Importante para las vistas de clases.
 */
export const getGroupsPublic = unstable_cache(
  async () => {
    return getCollectionPublic("grupos");
  },
  ["get-groups-public"],
  { revalidate: 3600, tags: ["collections", "grupos"] }
);

/**
 * Función PÚBLICA para obtener grupos de una clase específica (SSOT).
 */
export const getGroupsByClassPublic = async (classId: string) => {
  const { success, data, error } = await getGroupsPublic();
  if (!success) return { success: false, error };
  
  const filtered = (data as any[]).filter(g => g.class_id === classId);
  return { success: true, data: filtered };
};

/**
 * Función ADMIN para obtener colecciones CON autenticación.
 */
export const getCollectionAdmin = async (collectionName: string) => {
  await verifyAdminAccess();
  try {
    const snapshot = await adminDb.collection(collectionName).orderBy("last_updated", "desc").get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...serializeData(doc.data()) })) as unknown[];
    return { success: true, data };
  } catch (error) {
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
    
    let slug = rest.slug;
    const nameOrTitle = rest.name || rest.title;
    if (nameOrTitle && !slug) {
      slug = generateSlug(nameOrTitle);
    }

    const dataToSave = { 
      ...rest, 
      slug, 
      last_updated: new Date() 
    };

    // ELIMINAR CAMPOS PROHIBIDOS POR REGLAS DE ORO (SSOT)
    // Las clases no deben guardar IDs de grupos, y los alumnos no deben guardar sus grupos vinculados
    // NOTA: Según GEMINI.md, las relaciones se gestionan EXCLUSIVAMENTE en la colección 'grupos'.
    if (collectionName === "clases") {
      delete (dataToSave as any).groupIds;
    }
    
    if (collectionName === "alumnos") {
      delete (dataToSave as any).groups;
      if (dataToSave.age) {
        dataToSave.age = Number(dataToSave.age);
      }
    }

    let finalId = id;

    if (id) {
      await adminDb.collection(collectionName).doc(id).set(dataToSave, { merge: true });
    } else {
      const docRef = await adminDb.collection(collectionName).add(dataToSave);
      finalId = docRef.id;
    }

    // Revalidación global de colecciones
    (revalidateTag as any)("collections");
    if (collectionName === "grupos") (revalidateTag as any)("grupos");
    
    (revalidatePath as any)("/");
    (revalidatePath as any)("/clases");
    (revalidatePath as any)("/novedades");
    return { success: true, id: finalId };
  } catch (error) {
    console.error("Error en upsertItemAdmin:", error);
    return { success: false, error: String(error) };
  }
};

export const deleteItemAdmin = async (collectionName: string, id: string) => {
  try {
    await verifyAdminAccess();
    
    // Al eliminar un objeto, solo nos aseguramos de que no queden referencias huerfanas
    // en los objetos que apuntan a él (relaciones Many-to-One).

    if (collectionName === "clases") {
      // Si borro una clase, los grupos que apuntaban a ella quedan sin clase.
      const grupos = await adminDb.collection("grupos").where("class_id", "==", id).get();
      const batch = adminDb.batch();
      grupos.forEach(doc => {
        batch.update(doc.ref, { class_id: "" });
      });
      await batch.commit();
    }

    // Nota: Al borrar un Alumno o un Grupo, no hay arrays que limpiar en Clases
    // gracias a la regla de SSOT. Los vínculos se calculan filtrando la colección 'grupos'.

    await adminDb.collection(collectionName).doc(id).delete();
    
    // Revalidación global
    (revalidateTag as any)("collections");
    if (collectionName === "grupos") (revalidateTag as any)("grupos");

    (revalidatePath as any)("/");
    (revalidatePath as any)("/clases");
    (revalidatePath as any)("/novedades");
    return { success: true };
  } catch (error) {
    console.error("Error en deleteItemAdmin:", error);
    return { success: false, error: String(error) };
  }
};

/**
 * FUNCIÓN CRÍTICA: Procesar una inscripción (Alumno o Docente) (SSOT)
 * Usa transacciones para asegurar que no haya datos huérfanos.
 */
export const processEnrollmentAdmin = async (submissionId: string) => {
  try {
    await verifyAdminAccess();
    
    return await adminDb.runTransaction(async (transaction) => {
      // 1. Obtener datos de la inscripción
      const subRef = adminDb.collection("submissions").doc(submissionId);
      const subDoc = await transaction.get(subRef);
      
      if (!subDoc.exists) throw new Error("Inscripción no encontrada");
      const subData = subDoc.data()!;

      if (subData.type !== "clases") {
        throw new Error("Solo se pueden procesar inscripciones de clases");
      }

      const { role, fullname, group_id, age, email, phone, instrument } = subData;

      if (role === "alumno") {
        // a) Crear referencia para el nuevo Alumno
        const studentRef = adminDb.collection("alumnos").doc(); // Genera ID automático
        
        const newStudent = {
          name: fullname, 
          age: age ? Number(age) : null,
          email: email || "",
          phone: phone || "",
          status: "activo",
          instruments: [], // Para alumnos se deriva del grupo, pero dejamos el array vacío
          is_active: true,
          category: "alumnos",
          created_at: new Date(),
          last_updated: new Date()
        };

        transaction.set(studentRef, newStudent);

        // b) Vincular al Grupo
        if (group_id) {
          const groupRef = adminDb.collection("grupos").doc(group_id);
          transaction.update(groupRef, {
            students: admin.firestore.FieldValue.arrayUnion(studentRef.id)
          });
        }
      } 
      else if (role === "docente") {
        // a) Actualizar lista global de docentes (lectura/escritura en transacción)
        const teacherSettingsRef = adminDb.collection("settings").doc("teachers");
        const teacherDoc = await transaction.get(teacherSettingsRef);
        let currentTeachers = teacherDoc.exists ? (teacherDoc.data()?.list || []) : [];
        
        if (!currentTeachers.includes(fullname)) {
          currentTeachers.push(fullname);
          transaction.set(teacherSettingsRef, { list: currentTeachers }, { merge: true });
        }

        // b) Vincular al Grupo como docente
        if (group_id) {
          const groupRef = adminDb.collection("grupos").doc(group_id);
          transaction.update(groupRef, {
            teacher_names: admin.firestore.FieldValue.arrayUnion(fullname)
          });
        }
      }

      // 4. Marcar inscripción como gestionada
      transaction.update(subRef, { status: "gestionado" });

      return { success: true };
    });

  } catch (error) {
    console.error("ERROR EN TRANSACCIÓN processEnrollmentAdmin:", error);
    return { success: false, error: String(error) };
  } finally {
    // Revalidación fuera de la transacción
    (revalidateTag as any)("collections");
    (revalidateTag as any)("settings");
    (revalidatePath as any)("/dashboard");
  }
};

// --- GESTIÓN DE GALERÍA ---

/**
 * Función PÚBLICA para obtener imágenes de galería SIN autenticación (CON CACHE).
 */
export const getGalleryImagesPublic = unstable_cache(
  async () => {
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
  },
  ["get-gallery-public"],
  { revalidate: 3600, tags: ["gallery"] }
);

/**
 * Función ADMIN para obtener imágenes de galería CON autenticación.
 */
export const getGalleryImagesAdmin = async () => {
  await verifyAdminAccess();
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

    (revalidateTag as any)("gallery");
    (revalidatePath as any)("/galeria");
    (revalidatePath as any)("/");
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
    (revalidateTag as any)("gallery");
    (revalidatePath as any)("/galeria");
    (revalidatePath as any)("/");
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
    (revalidateTag as any)("gallery");
    (revalidatePath as any)("/galeria");
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

/**
 * Función PÚBLICA para obtener la lista de instrumentos (CON CACHE).
 */
export const getInstrumentsPublic = unstable_cache(
  async () => {
    try {
      const doc = await adminDb.collection("settings").doc("instruments").get();
      return { success: true, data: doc.exists ? doc.data()?.list || [] : [] };
    } catch (error) {
      return { success: false, error: String(error), data: [] };
    }
  },
  ["get-instruments-public"],
  { revalidate: 3600, tags: ["settings", "instruments"] }
);

export const updateInstrumentsAdmin = async (list: string[]) => {
  await verifyAdminAccess();
  await adminDb.collection("settings").doc("instruments").set({ list });
  (revalidateTag as any)("settings");
  (revalidatePath as any)("/", "layout");
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
  (revalidateTag as any)("settings");
  (revalidatePath as any)("/", "layout");
  return { success: true };
};

/**
 * Función PÚBLICA para obtener settings SIN autenticación (CON CACHE).
 */
export const getGlobalSettingsPublic = unstable_cache(
  async () => {
    try {
      const doc = await adminDb.collection("settings").doc("general").get();
      return { success: true, data: doc.exists && doc.data() ? serializeData(doc.data()!) : {} };
    } catch (error) {
      return { success: false, error: String(error), data: {} };
    }
  },
  ["get-settings-public"],
  { revalidate: 3600, tags: ["settings"] }
);

/**
 * Función ADMIN para obtener settings CON autenticación.
 */
export const getGlobalSettingsAdmin = async () => {
  await verifyAdminAccess();
  const doc = await adminDb.collection("settings").doc("general").get();
  return { success: true, data: doc.exists && doc.data() ? serializeData(doc.data()!) : {} };
};

export const updateGlobalSettingsAdmin = async (data: any) => {
  await verifyAdminAccess();
  await adminDb.collection("settings").doc("general").set({ ...data, last_updated: new Date() }, { merge: true });
  (revalidateTag as any)("settings");
  (revalidatePath as any)("/", "layout");
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
  (revalidatePath as any)("/dashboard/balances");
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
    (revalidateTag as any)("gallery");
    (revalidatePath as any)("/galeria");
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
    (revalidateTag as any)("gallery");
    (revalidatePath as any)("/galeria");
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
    (revalidateTag as any)("gallery");
    (revalidatePath as any)("/galeria");
    (revalidatePath as any)("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const getAdminCollectionItems = async (collectionName: string) => {
  try {
    await verifyAdminAccess();
    const snapshot = await adminDb.collection(collectionName).get();
    return snapshot.docs.map((doc) => serializeData({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error(`Error en getAdminCollectionItems para ${collectionName}:`, error);
    return [];
  }
};

// src/services/content.ts
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, documentId } from "firebase/firestore";
import { PageContent, SectionData, PageWithSections } from "@/types";

export async function getPageBySlug(slug: string): Promise<PageWithSections | null> {
  try {
    // 1. Buscamos la página por su slug (ej: "inicio")
    const pagesRef = collection(db, "pages");
    const q = query(pagesRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`Página no encontrada: ${slug}`);
      return null;
    }

    // Tomamos el primer resultado (debería ser único)
    const pageDoc = querySnapshot.docs[0];
    const pageData = pageDoc.data() as PageContent;
    
    // Si la página no tiene secciones definidas, devolvemos la data básica
    if (!pageData.sections || pageData.sections.length === 0) {
      return { ...pageData, id: pageDoc.id, renderedSections: [] };
    }

    // 2. Buscamos todas las secciones que coincidan con los IDs
    // Firestore permite buscar por ID de documento usando documentId()
    const sectionsRef = collection(db, "sections");
    const sectionsQuery = query(sectionsRef, where(documentId(), "in", pageData.sections));
    const sectionsSnapshot = await getDocs(sectionsQuery);

    const sectionsMap = new Map<string, SectionData>();
    sectionsSnapshot.forEach((doc) => {
      sectionsMap.set(doc.id, { id: doc.id, ...doc.data() } as SectionData);
    });

    // 3. Reordenamos las secciones según el orden original del array de la página
    // Esto es CLAVE para que el "rompecabezas" se arme como vos querés
    const renderedSections = pageData.sections
      .map((sectionId) => sectionsMap.get(sectionId))
      .filter((section): section is SectionData => section !== undefined);

    return {
      ...pageData,
      id: pageDoc.id,
      renderedSections,
    };

  } catch (error) {
    console.error("Error al obtener la página y sus secciones:", error);
    return null;
  }
}
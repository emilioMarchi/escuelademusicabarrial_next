import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  documentId, 
  limit 
} from "firebase/firestore";
import { PageContent, SectionData, PageWithSections, Class, News } from "@/types";

/**
 * Obtiene la configuración de una página (inicio, nosotros, etc) por su slug.
 */
export async function getPageBySlug(slug: string): Promise<PageWithSections | null> {
  if (!slug || typeof slug !== "string") return null;

  try {
    const pagesRef = collection(db, "pages");
    const q = query(pagesRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const pageDoc = querySnapshot.docs[0];
    const pageData = pageDoc.data() as PageContent;
    
    if (!pageData.sections || pageData.sections.length === 0) {
      return { ...pageData, id: pageDoc.id, renderedSections: [] };
    }

    const sectionIdsToFetch = pageData.sections.filter(s => typeof s === "string") as string[];
    const sectionsMap = new Map<string, SectionData>();

    if (sectionIdsToFetch.length > 0) {
      const sectionsRef = collection(db, "sections");
      const sectionsQuery = query(sectionsRef, where(documentId(), "in", sectionIdsToFetch));
      const sectionsSnapshot = await getDocs(sectionsQuery);

      sectionsSnapshot.forEach((doc) => {
        sectionsMap.set(doc.id, { id: doc.id, ...doc.data() } as SectionData);
      });
    }

    const renderedSections = pageData.sections.map((section, index) => {
      if (typeof section === "string") {
        return sectionsMap.get(section);
      }
      return {
        ...section,
        id: section.id || `${section.type}-${index}`
      };
    }).filter((s): s is SectionData => s !== undefined);

    return {
      ...pageData,
      id: pageDoc.id,
      renderedSections
    };
  } catch (error) {
    console.error("Error en getPageBySlug:", error);
    return null;
  }
}

/**
 * Busca un elemento (Clase o Noticia) por su slug (título formateado).
 * Primero busca en clases, luego en noticias.
 */
export async function getElementBySlug(slug: string): Promise<(Class | News | any) | null> {
  if (!slug) return null;

  try {
    // 1. Intentar buscar en la colección de Clases
    const classesRef = collection(db, "clases");
    const qClass = query(classesRef, where("slug", "==", slug), limit(1));
    const classSnap = await getDocs(qClass);

    if (!classSnap.empty) {
      return { 
        ...classSnap.docs[0].data(), 
        id: classSnap.docs[0].id, 
        contentType: 'clase' 
      };
    }

    // 2. Si no es una clase, intentar en Noticias
    const newsRef = collection(db, "noticias");
    const qNews = query(newsRef, where("slug", "==", slug), limit(1));
    const newsSnap = await getDocs(qNews);

    if (!newsSnap.empty) {
      return { 
        ...newsSnap.docs[0].data(), 
        id: newsSnap.docs[0].id, 
        contentType: 'noticia' 
      };
    }

    return null; // No se encontró en ninguna colección
  } catch (error) {
    console.error("Error en getElementBySlug:", error);
    return null;
  }
}
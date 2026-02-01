import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, documentId } from "firebase/firestore";
import { PageContent, SectionData, PageWithSections } from "@/types";

export async function getPageBySlug(slug: string): Promise<PageWithSections | null> {
  // --- PROTECCIÓN ANT-UNDEFINED ---
  if (!slug || typeof slug !== "string") {
    console.warn("⚠️ getPageBySlug fue llamado sin un slug válido.");
    return null;
  }

  try {
    const pagesRef = collection(db, "pages");
    const q = query(pagesRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const pageDoc = querySnapshot.docs[0];
    const pageData = pageDoc.data() as PageContent;
    
    // Si no hay secciones, devolvemos temprano
    if (!pageData.sections || pageData.sections.length === 0) {
      return { ...pageData, id: pageDoc.id, renderedSections: [] };
    }

    // 1. Separar IDs de Objetos
    const sectionIdsToFetch = pageData.sections.filter(s => typeof s === "string") as string[];
    const sectionsMap = new Map<string, SectionData>();

    // 2. Solo consultar secciones globales si hay IDs válidos
    if (sectionIdsToFetch.length > 0) {
      const sectionsRef = collection(db, "sections");
      const sectionsQuery = query(sectionsRef, where(documentId(), "in", sectionIdsToFetch));
      const sectionsSnapshot = await getDocs(sectionsQuery);

      sectionsSnapshot.forEach((doc) => {
        sectionsMap.set(doc.id, { id: doc.id, ...doc.data() } as SectionData);
      });
    }

    // 3. Mapeo final con generación de IDs para las keys de React
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
    console.error(`❌ Error en getPageBySlug para el slug "${slug}":`, error);
    return null;
  }
}
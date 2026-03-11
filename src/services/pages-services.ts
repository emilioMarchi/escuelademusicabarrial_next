import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  orderBy
} from "firebase/firestore";
import { PageContent } from "@/types";
import { unstable_cache } from "next/cache";

/**
 * Busca la configuración de una página (Header, SEO, Secciones) por su slug.
 */
export const getPageConfig = async (slug: string): Promise<PageContent | null> => {
  const q = query(collection(db, "pages"), where("slug", "==", slug), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as PageContent;
};

/**
 * Trae todos los ítems de una categoría (ej: todas las clases o todas las noticias) con CACHE.
 */
export const getCollectionByCategory = unstable_cache(
  async <T>(collectionName: string, category: string): Promise<T[]> => {
    // Intentamos ordenar por created_at o date según corresponda
    const orderField = collectionName === "noticias" ? "date" : "created_at";
    
    try {
      const q = query(
        collection(db, collectionName), 
        where("category", "==", category),
        orderBy(orderField, "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.warn(`Fallback: No se pudo ordenar ${collectionName} por ${orderField}. Quizás falte el índice o el campo.`);
      const q = query(collection(db, collectionName), where("category", "==", category));
      const querySnapshot = await getDocs(q);
      
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));

      // Orden manual básico si el campo existe pero no hay índice de Firestore
      return (results as any[]).sort((a, b) => {
        const valA = a[orderField] || 0;
        const valB = b[orderField] || 0;
        return valB > valA ? 1 : -1;
      });
    }
  },
  ["collection-by-category"],
  { revalidate: 3600, tags: ["collections"] }
);

/**
 * Trae el detalle de un ítem específico por su slug (ej: una clase puntual) con CACHE.
 */
export const getItemBySlug = unstable_cache(
  async <T>(collectionName: string, slug: string): Promise<T | null> => {
    const q = query(collection(db, collectionName), where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  },
  ["item-by-slug"],
  { revalidate: 3600, tags: ["collections"] }
);

export const getAllPagesForMenuRaw = async (): Promise<PageContent[]> => {
  const q = query(collection(db, "pages")); 
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageContent));
};

export const getAllPagesForMenu = unstable_cache(
  getAllPagesForMenuRaw,
  ["all-pages-menu"],
  { revalidate: 3600, tags: ["pages"] }
);

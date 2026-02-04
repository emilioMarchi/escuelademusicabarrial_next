// src/services/settings-services.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function fetchGeneralSettings() {
  try {
    const docRef = doc(db, "settings", "general");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // La "limpieza" para que Next.js no se queje:
      return {
        ...data,
        // Convertimos el Timestamp a milisegundos (un número plano)
        last_updated: data.last_updated?.toMillis() || null 
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}
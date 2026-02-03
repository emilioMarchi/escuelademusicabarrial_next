import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase"; // Ahora sí funciona porque exportamos 'app'

const storage = getStorage(app);

export const uploadImageToStorage = async (file: File): Promise<string> => {
  try {
    // Genera un nombre único: timestamp-nombre
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const storageRef = ref(storage, `uploads/${filename}`);
    
    // Sube el archivo
    await uploadBytes(storageRef, file);
    
    // Obtiene la URL pública
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    throw new Error("Error al subir la imagen");
  }
};
// src/lib/image-utils.ts
import imageCompression from 'browser-image-compression';

export async function getOptimizedImage(file: File): Promise<File> {
  // Si no es imagen (ej: video), devolvemos el archivo tal cual
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp' as const,
    initialQuality: 0.8,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
      type: 'image/webp',
    });
  } catch (error) {
    return file; 
  }
}
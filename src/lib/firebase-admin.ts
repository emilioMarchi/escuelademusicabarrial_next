// src/lib/firebase-admin.ts
import admin from "firebase-admin";

// Bucket centralizado: se lee de la variable de entorno o usa el valor por defecto.
// Agregá FIREBASE_STORAGE_BUCKET a tu .env para mayor flexibilidad.
export const STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET ?? "escuelita-db.firebasestorage.app";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: STORAGE_BUCKET,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();

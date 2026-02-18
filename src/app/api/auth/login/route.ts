// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Token no proporcionado." }, { status: 400 });
    }

    // 1. Verificar el idToken con Firebase Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // 2. Verificar que el email esté en la lista de admins autorizados
    const adminDoc = await adminDb.collection("settings").doc("admins").get();
    const allowedEmails: string[] = adminDoc.data()?.emails || [];

    if (!decodedToken.email || !allowedEmails.includes(decodedToken.email)) {
      return NextResponse.json(
        { error: "Acceso denegado: No sos un administrador autorizado." },
        { status: 403 }
      );
    }

    // 3. Crear la cookie de sesión (válida por 5 días)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días en ms
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // 4. Setear la cookie en la respuesta
    const response = NextResponse.json({ success: true });
    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresIn / 1000, // en segundos
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error en /api/auth/login:", error);
    return NextResponse.json(
      { error: "Error al autenticar. Intentá de nuevo." },
      { status: 401 }
    );
  }
}

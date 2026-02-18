// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // Eliminar la cookie de sesión seteando maxAge a 0
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error en /api/auth/logout:", error);
    return NextResponse.json({ error: "Error al cerrar sesión." }, { status: 500 });
  }
}

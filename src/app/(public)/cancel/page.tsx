// src/app/api/payments/cancel/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const donationId = searchParams.get("id");
  
  // Usamos la variable de entorno para el redireccionamiento
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://escuelademusicabarrial.ar";

  if (!donationId) {
    return NextResponse.redirect(new URL("/", siteUrl));
  }

  try {
    // Actualizamos el estado en la colección 'donations'
    await adminDb.collection("donations").doc(donationId).update({
      status: "cancelled",
      cancelled_at: new Date()
    });

    // Redirigimos a la página física que ya creaste
    return NextResponse.redirect(new URL("/cancelado", siteUrl));
    
  } catch (error) {
    console.error("❌ Error al cancelar aporte:", error);
    // En caso de error, volvemos al inicio para no dejar al usuario en una página rota
    return NextResponse.redirect(new URL("/", siteUrl));
  }
}
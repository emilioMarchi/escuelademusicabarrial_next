import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const donationId = searchParams.get("id");
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://escuelademusicabarrial.ar";

  if (donationId) {
    try {
      await adminDb.collection("donations").doc(donationId).update({
        status: "cancelled",
        cancelled_at: new Date()
      });
      console.log(`✅ Aporte ${donationId} cancelado correctamente.`);
    } catch (error) {
      console.error("❌ Error en Firebase:", error);
    }
  }

  // Redirigimos al home con un parámetro para avisar
  return NextResponse.redirect(new URL("/?status=cancelled", siteUrl));
}
// src/app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const donationId = searchParams.get("donationId");
  const mpId = searchParams.get("mpId");

  if (!donationId || !mpId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  try {
    const docRef = adminDb.collection("donations").doc(donationId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Donación no encontrada" }, { status: 404 });
    }

    const data = docSnap.data();

    // Si ya está aprobado por el Webhook, no hacemos nada extra
    if (data?.status === "approved") {
      return NextResponse.json({ status: "already_approved" });
    }

    // Aprobación forzada confiando en el retorno de la URL de MP
    await docRef.update({
      status: "approved",
      approved_at: new Date(),
      // Guardamos el ID detectando si es suscripción o pago
      ...(mpId.startsWith("pre") 
          ? { mp_subscription_id: mpId } 
          : { mp_payment_id: mpId }
      )
    });

    return NextResponse.json({ status: "verified_and_updated" });
  } catch (error) {
    console.error("Error en verify route:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createMPPreference, createMPSubscription } from "@/lib/mercadopago";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, email, amount } = body;

    // Generamos un ID de antemano pero NO lo guardamos todavía
    const donationRef = adminDb.collection("donations").doc();
    const donationId = donationRef.id;

    let result;

    try {
      if (type === "subscription") {
        result = await createMPSubscription({ 
          name, 
          email, 
          amount, 
          external_reference: donationId 
        });
      } else {
        result = await createMPPreference({ 
          name, 
          email, 
          amount, 
          external_reference: donationId 
        });
      }
    } catch (mpError: any) {
      // Si MP falla, logueamos el error REAL y cortamos acá. No se guarda nada en DB.
      console.error("ERROR DETALLADO DE MP:", mpError.response?.data || mpError.message);
      return NextResponse.json(
        { error: "Error en la plataforma de pago", details: mpError.response?.data }, 
        { status: 400 }
      );
    }

    // SI LLEGAMOS ACÁ, MP funcionó. Ahora sí guardamos en Firebase.
    await donationRef.set({
      id: donationId,
      name,
      email,
      amount,
      type,
      status: "pending",
      mp_id: result.id, // Guardamos el ID de preferencia o preapproval
      created_at: new Date(),
    });

    return NextResponse.json({ 
      init_point: result.init_point || result.sandbox_init_point 
    });

  } catch (error: any) {
    console.error("ERROR GENERAL API:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
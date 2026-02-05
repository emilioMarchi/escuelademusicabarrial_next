// src/app/api/webhooks/mercadopago/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
  
  // Intentamos obtener el ID de todas las formas que MP suele enviarlo
  const type = url.searchParams.get("type");
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id"); 

  console.log("🔔 Notificación de MP recibida:", { type, dataId });

    // CASO A: Pago único
    if (type === "payment" && dataId) {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN_MP}` }
      });
      const payment = await mpRes.json();

      if (payment.status === "approved") {
        const donationId = payment.external_reference;
        if (donationId) {
          await adminDb.collection("donations").doc(donationId).update({
            status: "approved",
            mp_payment_id: dataId,
            approved_at: new Date()
          });
        }
      }
    }

    // CASO B: Suscripción (Preapproval)
    if (type === "subscription_preapproval" && dataId) {
    const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
      headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN_MP}` }
    });
    const subscription = await mpRes.json();

      // En suscripciones el estado exitoso es "authorized"
      if (subscription.status === "authorized") {
        const donationId = subscription.external_reference;
        if (donationId) {
          await adminDb.collection("donations").doc(donationId).update({
            status: "approved",
            mp_subscription_id: dataId,
            approved_at: new Date()
          });
          console.log(`✅ Suscripción ${donationId} actualizada a approved`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en Webhook:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
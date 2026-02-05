// src/app/api/webhooks/mercadopago/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { resend, getEmailSettings, userEmailTemplate, adminEmailTemplate } from "@/lib/resend";

/**
 * Función para enviar correos de éxito con diseño mejorado
 */
const sendSuccessEmails = async (donationData: any, isSubscription: boolean) => {
  const { schoolEmail, schoolName, senderEmail } = await getEmailSettings();
  
  // Extraemos el ID de comprobante según el tipo
  const comprobante = isSubscription ? donationData.mp_subscription_id : donationData.mp_payment_id;
  
  // URL de tu sitio (asegurate de tenerla en tu .env)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://escuelademusica.ar";
  
  // Construimos la URL de "Gracias" con los parámetros que MP suele enviar
  // Esto permite que tu componente DonationSuccess reconozca la operación
  const thanksUrl = `${siteUrl}/gracias?payment_id=${comprobante}&status=approved&external_reference=${donationData.id}&preference_id=${donationData.mp_id}`;

  const typeTitle = isSubscription ? "Suscripción Mensual" : "Donación Única";
  const userSubject = isSubscription ? "✨ ¡Bienvenido a nuestra comunidad de socios! 🎸" : "✨ ¡Aporte confirmado! Gracias por tu apoyo 🎸";
  
  const userMessage = isSubscription 
    ? `<p>¡Hola <b>${donationData.name}</b>! ✨ Es un honor darte la bienvenida como socio mensual.</p>
       <p>Tu compromiso constante es el motor que permite que la Escuela siga brindando arte y educación al barrio todos los días.</p>`
    : `<p>¡Hola <b>${donationData.name}</b>! ✨ Hemos recibido tu aporte con muchísima alegría.</p>
       <p>Gracias por sumar tu nota a esta melodía colectiva; cada donación nos ayuda a seguir transformando realidades a través de la música.</p>`;

  // A. AVISO PARA LA ESCUELA (ADMIN) 🔔
  await resend.emails.send({
    from: `Pagos Web <${senderEmail}>`,
    to: [schoolEmail, 'tpcagencia@gmail.com'], 
    subject: `✅ ¡Ingresó un pago! ($${donationData.amount})`,
    html: adminEmailTemplate(`Pago Confirmado (${typeTitle})`, `
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; border: 1px solid #bbf7d0;">
        <p style="margin: 0 0 10px 0;">💰 <b>Monto acreditado:</b> $${donationData.amount}</p>
        <p style="margin: 0 0 10px 0;">👤 <b>Donante:</b> ${donationData.name} (${donationData.email})</p>
        <p style="margin: 0 0 10px 0;">📄 <b>Comprobante MP:</b> <code style="background: #fff; padding: 2px 5px;">${comprobante}</code></p>
        <p style="margin: 0;">🔗 <b>ID Interno:</b> ${donationData.id}</p>
      </div>
    `)
  });

  // B. GRACIAS PARA EL USUARIO (DONANTE) 💖
  await resend.emails.send({
    from: `${schoolName} <${senderEmail}>`,
    to: donationData.email,
    subject: userSubject,
    html: userEmailTemplate("¡Todo listo y confirmado!", `
      ${userMessage}
      
      <p>Podés ver y descargar tu comprobante oficial en nuestra web haciendo clic en el siguiente botón:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${thanksUrl}" style="background-color: #f97316; color: white; padding: 14px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(249, 115, 22, 0.2);">
          VER COMPROBANTE EN LA WEB ➜
        </a>
      </div>

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 14px;">
        <p style="margin: 0 0 5px 0; color: #64748b;"><b>Resumen de tu operación:</b></p>
        <p style="margin: 2px 0;">✅ <b>Estado:</b> Aprobado</p>
        <p style="margin: 2px 0;">💵 <b>Monto:</b> $${donationData.amount}</p>
        <p style="margin: 2px 0;">🆔 <b>Nro. de Transacción:</b> ${comprobante}</p>
      </div>
    `)
  });
};

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const dataId = url.searchParams.get("data.id") || url.searchParams.get("id"); 

    console.log("🔔 Notificación de MP recibida:", { type, dataId });

    if (!dataId) return NextResponse.json({ received: true });

    // CASO A: Pago único
    if (type === "payment") {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN_MP}` }
      });
      const payment = await mpRes.json();

      if (payment.status === "approved") {
        const donationId = payment.external_reference;
        if (donationId) {
          const docRef = adminDb.collection("donations").doc(donationId);
          await docRef.update({
            status: "approved",
            mp_payment_id: dataId,
            approved_at: new Date()
          });

          const docSnap = await docRef.get();
          if (docSnap.exists) {
            await sendSuccessEmails(docSnap.data(), false);
          }
        }
      }
    }

    // CASO B: Suscripción
    if (type === "subscription_preapproval") {
      const mpRes = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
        headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN_MP}` }
      });
      const subscription = await mpRes.json();

      if (subscription.status === "authorized") {
        const donationId = subscription.external_reference;
        if (donationId) {
          const docRef = adminDb.collection("donations").doc(donationId);
          await docRef.update({
            status: "approved",
            mp_subscription_id: dataId,
            approved_at: new Date()
          });

          const docSnap = await docRef.get();
          if (docSnap.exists) {
            await sendSuccessEmails(docSnap.data(), true);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error en Webhook:", error);
    return NextResponse.json({ error: "Webhook Error" }, { status: 500 });
  }
}
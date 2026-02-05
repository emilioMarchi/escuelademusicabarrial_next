// src/app/api/payments/route.ts
import { NextResponse } from "next/server";
import { createMPPreference, createMPSubscription } from "@/lib/mercadopago";
import { adminDb } from "@/lib/firebase-admin";
import { resend, getEmailSettings, adminEmailTemplate, userEmailTemplate } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, email, amount } = body;

    const donationRef = adminDb.collection("donations").doc();
    const donationId = donationRef.id;

    let result;
    const { schoolEmail, senderEmail, schoolName } = await getEmailSettings();

    // 1. GENERAR EL PAGO EN MERCADO PAGO
    try {
      if (type === "subscription") {
        result = await createMPSubscription({ 
          name, email, amount, external_reference: donationId 
        });
      } else {
        result = await createMPPreference({ 
          name, email, amount, external_reference: donationId 
        });
      }
    } catch (mpError: any) {
      console.error("❌ ERROR MP:", mpError.response?.data || mpError.message);
      return NextResponse.json({ error: "Error en Mercado Pago" }, { status: 400 });
    }

    const paymentLink = result.init_point || result.sandbox_init_point;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://escuelademusica.ar";
    
    // Link que apunta a nuestra nueva API de cancelación
    const cancelLink = `${siteUrl}/api/payments/cancel?id=${donationId}`;

    // 2. ENVIAR NOTIFICACIONES
    try {
      const isSub = type === "subscription";

      // Mail para el USUARIO ✨
      await resend.emails.send({
        from: `${schoolName} <${senderEmail}>`,
        to: email,
        subject: `¡Casi listo! Tu link de aporte para la Escuela 🎹`,
        html: userEmailTemplate("¡Gracias por tu interés!", `
          <p>Hola <b>${name}</b>, ¡vimos que iniciaste el proceso para colaborar con la escuela! ❤️</p>
          <p>Si se cerró la ventana o tuviste algún problema, podés completar tu aporte haciendo clic en el siguiente botón:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background-color: #f97316; color: white; padding: 14px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              CONTINUAR CON EL APORTE ➜
            </a>
          </div>

          <p style="text-align: center; margin-top: 10px;">
            <a href="${cancelLink}" style="color: #ef4444; font-size: 13px; text-decoration: underline;">
              No quiero realizar este aporte, cancelar solicitud
            </a>
          </p>

          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            Si el botón no funciona, podés copiar este link: <br/> ${paymentLink}
          </p>
        `)
      });

      // Mail para la ESCUELA 🔔
      await resend.emails.send({
        from: `Notificaciones-${schoolName} <${senderEmail}>`,
        to: [schoolEmail, 'tpcagencia@gmail.com'],
        subject: `💰 Intento de aporte: ${name}`,
        html: adminEmailTemplate(
          isSub ? 'Nuevo Intento de Suscripción' : 'Nuevo Intento de Donación', 
          `
            <div style="background: #fff7ed; padding: 15px; border-radius: 8px;">
              <p style="margin: 5px 0;">👤 <b>Usuario:</b> ${name}</p>
              <p style="margin: 5px 0;">💵 <b>Monto:</b> $${amount}</p>
              <p style="margin: 15px 0 5px;">🔗 <b>Link de pago (por si el usuario lo pide):</b></p>
              <a href="${paymentLink}" style="color: #f97316; word-break: break-all;">${paymentLink}</a>
            </div>
          `
        )
      });
    } catch (e) { console.error("Error mails inicio:", e); }

    // 3. GUARDAR EN FIREBASE
    await donationRef.set({
      id: donationId,
      name, email, amount, type,
      status: "pending",
      mp_id: result.id, 
      payment_link: paymentLink,
      created_at: new Date(),
    });

    return NextResponse.json({ init_point: paymentLink });

  } catch (error: any) {
    console.error("❌ ERROR GENERAL:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
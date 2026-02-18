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

      // ── Mail para el USUARIO ──────────────────────────────────────────
      const userSubject = isSub
        ? `🎵 ¡Ya casi! Activá tu suscripción mensual a la Escuela`
        : `🎹 ¡Gracias! Completá tu donación a la Escuela de Música`;

      const userTitle = isSub
        ? "¡Querés sumarte de forma continua!"
        : "¡Querés hacer una diferencia!";

      const userBody = isSub
        ? `
          <p>Hola <b>${name}</b>, ¡qué emoción que quieras ser parte mensual de la escuela! 🙌</p>

          <div style="background:#f0fdf4; border-left:4px solid #22c55e; padding:14px 18px; border-radius:6px; margin:20px 0;">
            <p style="margin:0; font-size:15px;">📅 <b>Suscripción mensual</b> — <span style="color:#22c55e; font-weight:bold;">$${amount} / mes</span></p>
            <p style="margin:6px 0 0; font-size:13px; color:#555;">Se renovará automáticamente cada mes. Podés cancelarla cuando quieras.</p>
          </div>

          <p>Hacé clic en el botón para activar tu suscripción de forma segura a través de Mercado Pago:</p>

          <div style="text-align:center; margin:28px 0;">
            <a href="${paymentLink}" style="background-color:#22c55e; color:white; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:15px; display:inline-block; letter-spacing:0.5px;">
              ACTIVAR SUSCRIPCIÓN ➜
            </a>
          </div>

          <p style="text-align:center; margin-top:8px;">
            <a href="${cancelLink}" style="color:#ef4444; font-size:12px; text-decoration:underline;">
              No quiero suscribirme, cancelar solicitud
            </a>
          </p>
        `
        : `
          <p>Hola <b>${name}</b>, gracias por querer colaborar con la escuela. ❤️</p>

          <div style="background:#fff7ed; border-left:4px solid #f97316; padding:14px 18px; border-radius:6px; margin:20px 0;">
            <p style="margin:0; font-size:15px;">💛 <b>Donación única</b> — <span style="color:#f97316; font-weight:bold;">$${amount}</span></p>
            <p style="margin:6px 0 0; font-size:13px; color:#555;">Pago único a través de Mercado Pago. Sin compromisos futuros.</p>
          </div>

          <p>Si la ventana se cerró o hubo algún problema, completá tu aporte desde acá:</p>

          <div style="text-align:center; margin:28px 0;">
            <a href="${paymentLink}" style="background-color:#f97316; color:white; padding:14px 28px; text-decoration:none; border-radius:8px; font-weight:bold; font-size:15px; display:inline-block; letter-spacing:0.5px;">
              COMPLETAR DONACIÓN ➜
            </a>
          </div>

          <p style="text-align:center; margin-top:8px;">
            <a href="${cancelLink}" style="color:#ef4444; font-size:12px; text-decoration:underline;">
              No quiero realizar este aporte, cancelar solicitud
            </a>
          </p>
        `;

      await resend.emails.send({
        from: `${schoolName} <${senderEmail}>`,
        to: email,
        subject: userSubject,
        html: userEmailTemplate(userTitle, `
          ${userBody}
          <p style="font-size:11px; color:#999; margin-top:28px; border-top:1px solid #eee; padding-top:12px;">
            Si el botón no funciona, copiá este link en tu navegador:<br/>
            <span style="word-break:break-all;">${paymentLink}</span>
          </p>
        `)
      });

      // ── Mail para la ESCUELA ──────────────────────────────────────────
      const adminSubject = isSub
        ? `🔄 Nueva suscripción mensual: ${name} — $${amount}/mes`
        : `💰 Nueva donación única: ${name} — $${amount}`;

      const badgeColor = isSub ? "#22c55e" : "#f97316";
      const badgeText = isSub ? "SUSCRIPCIÓN MENSUAL" : "DONACIÓN ÚNICA";
      const badgeIcon = isSub ? "🔄" : "💛";
      const amountLabel = isSub ? `$${amount} <span style="font-size:12px;color:#666;">/mes</span>` : `$${amount}`;

      await resend.emails.send({
        from: `Notificaciones-${schoolName} <${senderEmail}>`,
        to: [schoolEmail, 'tpcagencia@gmail.com'],
        subject: adminSubject,
        html: adminEmailTemplate(
          `${badgeIcon} Nuevo aporte iniciado`,
          `
            <div style="display:inline-block; background:${badgeColor}; color:white; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:bold; letter-spacing:1px; margin-bottom:18px;">
              ${badgeText}
            </div>

            <table style="width:100%; border-collapse:collapse; font-size:14px;">
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0; color:#64748b; width:40%;">👤 Nombre</td>
                <td style="padding:10px 0; font-weight:600;">${name}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0; color:#64748b;">📧 Email</td>
                <td style="padding:10px 0;">${email}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 0; color:#64748b;">💵 Monto</td>
                <td style="padding:10px 0; font-weight:700; font-size:16px; color:${badgeColor};">${amountLabel}</td>
              </tr>
              <tr>
                <td style="padding:10px 0; color:#64748b;">📋 Tipo</td>
                <td style="padding:10px 0;">${isSub ? "Suscripción mensual (recurrente)" : "Donación única"}</td>
              </tr>
            </table>

            <div style="margin-top:20px; padding:14px; background:#f8fafc; border-radius:8px;">
              <p style="margin:0 0 6px; font-size:12px; color:#64748b; font-weight:600;">🔗 LINK DE PAGO</p>
              <a href="${paymentLink}" style="color:${badgeColor}; font-size:13px; word-break:break-all;">${paymentLink}</a>
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
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { resend, getEmailSettings, adminEmailTemplate, userEmailTemplate } from "@/lib/resend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const donationId = searchParams.get("id");
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://escuelademusicabarrial.ar";

  if (donationId) {
    try {
      // 1. Obtenemos los datos de la donación antes de actualizar (para el mail)
      const donationDoc = await adminDb.collection("donations").doc(donationId).get();
      
      if (donationDoc.exists) {
        const donationData = donationDoc.data();

        // 2. Actualizamos el estado en Firebase
        await adminDb.collection("donations").doc(donationId).update({
          status: "cancelled",
          cancelled_at: new Date()
        });

        // 3. Enviamos los mails de aviso de cancelación
        const { schoolEmail, senderEmail, schoolName } = await getEmailSettings();

        try {
          // Mail para el USUARIO ✉️
          await resend.emails.send({
            from: `${schoolName} <${senderEmail}>`,
            to: donationData?.email,
            subject: `Aporte cancelado - ${schoolName}`,
            html: userEmailTemplate("Aporte Cancelado", `
              <p>Hola <b>${donationData?.name}</b>, te confirmamos que la solicitud de aporte por <b>$${donationData?.amount}</b> ha sido cancelada correctamente.</p>
              <p>Si fue un error, podés volver a iniciar el proceso desde nuestra web cuando quieras.</p>
            `)
          });

          // Mail para la ESCUELA 🔔
          await resend.emails.send({
            from: `Notificaciones-${schoolName} <${senderEmail}>`,
            to: [schoolEmail, 'tpcagencia@gmail.com'],
            subject: `❌ Aporte Cancelado: ${donationData?.name}`,
            html: adminEmailTemplate("Aporte Cancelado", `
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fee2e2;">
                <p>👤 <b>Usuario:</b> ${donationData?.name}</p>
                <p>📧 <b>Email:</b> ${donationData?.email}</p>
                <p>💵 <b>Monto que era:</b> $${donationData?.amount}</p>
                <p>🚫 <b>Estado:</b> El usuario canceló la solicitud desde el link del mail.</p>
              </div>
            `)
          });
        } catch (mailError) {
          console.error("❌ Error enviando mails de cancelación:", mailError);
        }

        console.log(`✅ Aporte ${donationId} cancelado y notificado.`);
      }
    } catch (error) {
      console.error("❌ Error en proceso de cancelación:", error);
    }
  }

  // Redirigimos al home con el parámetro
return NextResponse.redirect(new URL(`/pago-cancelado?id=${donationId}`, siteUrl));
}
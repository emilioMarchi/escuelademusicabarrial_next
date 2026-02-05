// src/components/sections/donations/DonationSuccess.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  limit, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Share2, CheckCircle2, Loader2, Music, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function DonationSuccess() {
  const searchParams = useSearchParams();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mercado Pago envía estos parámetros en la URL de retorno
  const extRef = searchParams.get("external_reference");
  const mpIdFromUrl = searchParams.get("preapproval_id") || 
                     searchParams.get("payment_id") || 
                     searchParams.get("collection_id");

  useEffect(() => {
    // Si no hay ninguna referencia, no podemos buscar nada
    if (!extRef && !mpIdFromUrl) {
      setLoading(false);
      return;
    }

    // Buscamos por external_reference (campo id) o por el ID de MP (campo mp_id)
    const q = query(
      collection(db, "donations"),
      where(extRef ? "id" : "mp_id", "==", extRef || mpIdFromUrl),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const docSnapshot = snapshot.docs[0];
        const docData = docSnapshot.data();
        setDonation(docData);

        if (docData.status === "approved") {
          setLoading(false);
        } else if (mpIdFromUrl) {
          // Si el pago está 'pending' pero tenemos el ID de éxito de la URL,
          // lo aprobamos directamente desde aquí para evitar el error 404 de la API
          try {
            await updateDoc(docSnapshot.ref, {
              status: "approved",
              approved_at: serverTimestamp(),
              // Guardamos el ID que falte según el tipo
              [mpIdFromUrl.startsWith("pre") ? "mp_subscription_id" : "mp_payment_id"]: mpIdFromUrl
            });
            // El onSnapshot detectará este update y pondrá loading en false solo
          } catch (err) {
            console.error("Error actualizando estado:", err);
          }
        }
      } else {
        // Si no aparece nada en 8 segundos, cancelamos el loader
        const timer = setTimeout(() => setLoading(false), 8000);
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, [extRef, mpIdFromUrl]);

  const handleShare = async () => {
    const text = `¡Acabo de apoyar a la Escuela de Música Barrial! 🎸`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Donación Escuela de Música",
          text: text,
          url: window.location.origin,
        });
      } catch (err) {
        console.log("Error al compartir", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold uppercase italic font-serif text-black">
          Sincronizando con la Escuela...
        </h2>
        <p className="text-slate-500 text-xs italic">Confirmando tu aporte con Mercado Pago</p>
      </div>
    );
  }

  if (!donation || donation.status !== "approved") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-serif">
        <h2 className="text-xl font-bold uppercase tracking-tighter text-black">Aporte en proceso</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-xs">
          Estamos esperando la confirmación final de Mercado Pago. Si el pago fue exitoso, los datos aparecerán en breve.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 border border-black px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
        >
          Verificar ahora
        </button>
      </div>
    );
  }

  return (
    <section className="py-20 px-6 min-h-screen bg-slate-50 flex items-center justify-center font-serif">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className="bg-black p-8 text-center relative">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} 
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 size={32} className="text-white" />
          </motion.div>
          <h1 className="text-white font-black uppercase italic text-3xl tracking-tighter italic">
            ¡Gracias, {donation.name}!
          </h1>
          <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Donación Confirmada
          </p>
        </div>

        <div className="p-10 space-y-6 text-black uppercase font-sans">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest">Contribución</p>
              <p className="font-bold text-lg leading-tight tracking-tighter font-serif">
                {donation.type === 'subscription' ? 'Suscripción' : 'Aporte Único'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold tracking-widest">Monto</p>
              <p className="text-3xl font-black italic tracking-tighter font-serif">
                ${donation.amount}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-[9px] text-slate-400 font-bold mb-1 tracking-widest text-center">Comprobante</p>
            <p className="font-mono text-[9px] text-center text-slate-500 break-all uppercase">
              {donation.mp_id || mpIdFromUrl}
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button 
              onClick={handleShare}
              className="w-full bg-black text-white py-4 rounded-lg text-[10px] font-bold tracking-[0.2em] hover:bg-orange-600 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 size={14} /> Compartir Logro
            </button>
            <a 
              href="/" 
              className="text-center py-2 text-[9px] font-bold text-slate-400 hover:text-black transition-colors"
            >
              Volver al inicio
            </a>
          </div>
        </div>

        <div className="p-4 text-center border-t border-slate-100 bg-slate-50/50">
          <p className="text-[9px] text-slate-400 italic flex items-center justify-center gap-1 font-serif">
            Tu ayuda permite que más chicos del barrio accedan al arte <Heart size={10} className="fill-red-500 text-red-500 ml-1" />
          </p>
        </div>
      </motion.div>
    </section>
  );
}
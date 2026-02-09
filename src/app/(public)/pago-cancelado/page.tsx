import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { XCircle, ArrowLeft, Heart, Calendar } from "lucide-react";

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function PagoCanceladoPage({ searchParams }: Props) {
  const { id } = await searchParams;
  let donationData = null;

  // Si hay ID, buscamos la info en Firebase
  if (id) {
    const doc = await adminDb.collection("donations").doc(id).get();
    if (doc.exists) {
      donationData = doc.data();
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full text-center">
        
        {/* Icono de Cancelado */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-red-100 rounded-full scale-150 blur-2xl opacity-50" />
          <XCircle size={80} className="relative text-red-500 mx-auto" strokeWidth={1.5} />
        </div>

        <h1 className="font-serif italic text-4xl md:text-5xl text-slate-900 mb-6 tracking-tight">
          Aporte cancelado
        </h1>

        {/* --- DATOS DEL PAGO CANCELADO --- */}
        {donationData ? (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-10 text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 border-b border-slate-200 pb-2">
              Detalle de la solicitud
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Donante</span>
                <span className="text-xs font-bold text-slate-900">{donationData.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Monto</span>
                <span className="text-xs font-black text-slate-900">${donationData.amount.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Referencia</span>
                <span className="text-[10px] font-mono text-slate-500">{id}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            No se realizó ningún cargo. Podés volver a intentarlo cuando prefieras.
          </p>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/como-ayudar" 
            className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-2xl hover:bg-green-600 transition-all shadow-xl active:scale-95"
          >
            Intentar nuevamente
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-slate-900 transition-colors py-4"
          >
            <ArrowLeft size={14} /> Volver al Inicio
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-300">
          <Heart size={12} fill="currentColor" />
          <span className="text-[8px] font-black uppercase tracking-widest">
            Escuela de Música Barrial
          </span>
        </div>
      </div>
    </main>
  );
}
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Music } from "lucide-react";

export default function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Al no poder usar el objeto 'metadata' en componentes de cliente,
    // se define el título de esta manera para evitar errores en Vercel.
    document.title = "Acceso Admin | Escuela de Música Barrial";

    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center space-y-8">
        <div className="inline-flex p-5 bg-slate-900 text-white rounded-3xl mb-4">
          <Music size={40} />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Acceso Admin</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
            Escuela de Música Barrial
          </p>
        </div>
        
        <button 
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 p-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
          Ingresar con Google
        </button>
      </div>
    </div>
  );
}
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { Music, AlertTriangle } from "lucide-react";

// Mensajes de error según el parámetro recibido desde el middleware
const errorMessages: Record<string, string> = {
  session_invalid: "Tu sesión expiró o es inválida. Por favor, volvé a ingresar.",
};

// Componente interno que usa useSearchParams (debe estar dentro de Suspense)
function LoginContent() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const errorParam = searchParams.get("error");
  const errorMessage = errorParam ? errorMessages[errorParam] : null;

  useEffect(() => {
    document.title = "Acceso Admin | Escuela de Música Barrial";
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
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

      {/* Mensaje de error amigable (ej: sesión expirada) */}
      {errorMessage && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold p-4 rounded-2xl text-left">
          <AlertTriangle size={16} className="shrink-0 text-amber-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        onClick={loginWithGoogle}
        className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 p-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95"
      >
        <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
        Ingresar con Google
      </button>
    </div>
  );
}

// Componente principal: envuelve LoginContent en Suspense (requerido por Next.js para useSearchParams)
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cargando...</p>
          </div>
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}

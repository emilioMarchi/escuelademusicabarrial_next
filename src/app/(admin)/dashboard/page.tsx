// src/app/(admin)/dashboard/page.tsx
"use client";
import { useState } from "react";
import { savePageConfigAdmin, seedSectionsAdmin, seedClassesAdmin, seedNewsAdmin } from "@/services/admin-services";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);

  const runAction = async (action: () => Promise<{success: boolean, error?: any}>, msg: string) => {
    setLoading(true);
    const res = await action();
    setLoading(false);
    if (res.success) alert(msg);
  };

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-black uppercase tracking-tighter">Admin Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Estructura Web</h2>
          <button onClick={() => runAction(() => savePageConfigAdmin("inicio", { /* data */ }), "Inicio Creado")} disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">1. Configurar Inicio</button>
          <button onClick={() => runAction(seedSectionsAdmin, "Secciones Creadas")} disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">2. Cargar Secciones</button>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Contenido de Muestra</h2>
          <button onClick={() => runAction(seedClassesAdmin, "Clases Cargadas")} disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">Cargar Clases (Real)</button>
          <button onClick={() => runAction(seedNewsAdmin, "Noticias Cargadas")} disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">Cargar Noticias (Real)</button>
        </div>
      </div>
    </div>
  );
}
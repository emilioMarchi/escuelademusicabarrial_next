"use client";
import { useState } from "react";
import { 
  seedSectionsAdmin, 
  seedClassesAdmin, 
  seedNewsAdmin,
  seedAllPagesProfessional 
} from "@/services/admin-services";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);

  const runAction = async (action: () => Promise<{success: boolean, error?: any}>, msg: string) => {
    setLoading(true);
    const res = await action();
    setLoading(false);
    if (res.success) alert(`Éxito: ${msg}`);
    else alert(`Error: ${JSON.stringify(res.error)}`);
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Admin Control Panel</h1>
        <p className="text-slate-500 font-bold text-xs uppercase mt-2">Herramientas de desarrollo y sincronización</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-gradient-to-br from-green-500 to-green-700 rounded-[2.5rem] text-white shadow-2xl">
          <h2 className="font-black uppercase text-xs tracking-widest opacity-80 mb-4">Sincronización Global</h2>
          <p className="text-sm font-medium mb-6">Este botón convierte todas las secciones del sitio en bloques editables con la data real.</p>
          <button 
            disabled={loading}
            onClick={() => runAction(seedAllPagesProfessional, "Todo el sitio sincronizado")} 
            className="w-full bg-white text-green-700 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? "Procesando..." : "🚀 Sincronizar Todo el Sitio"}
          </button>
        </div>

        <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-4">Datos Base</h2>
          <button onClick={() => runAction(seedSectionsAdmin, "Secciones")} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-[9px] uppercase tracking-widest">Cargar Estructura</button>
          <button onClick={() => runAction(seedClassesAdmin, "Clases")} className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold text-[9px] uppercase tracking-widest">Cargar Clases</button>
          <button onClick={() => runAction(seedNewsAdmin, "Noticias")} className="w-full bg-slate-100 text-slate-600 py-4 rounded-xl font-bold text-[9px] uppercase tracking-widest">Cargar Noticias</button>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useState } from "react";
import { 
  seedSectionsAdmin, 
  seedClassesAdmin, 
  seedNewsAdmin,
  seedPageNosotrosHybrid,
  seedPageInicioConSlider 
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
      <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 italic underline decoration-green-500">
        Technical Control Panel
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Base de Datos</h2>
          <button onClick={() => runAction(seedSectionsAdmin, "Estructura Base")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90">1. Cargar Secciones Globales</button>
          <button onClick={() => runAction(seedClassesAdmin, "Clases")} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90">2. Cargar Clases</button>
          <button onClick={() => runAction(seedNewsAdmin, "Noticias")} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90">3. Cargar Noticias</button>
        </div>

        <div className="p-8 bg-white rounded-[2rem] border border-orange-200 shadow-sm space-y-4">
          <h2 className="font-bold text-orange-600 uppercase text-xs tracking-widest">Páginas Específicas</h2>
          <button onClick={() => runAction(seedPageInicioConSlider, "Inicio")} className="w-full border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50">Configurar Página Inicio</button>
          <button onClick={() => runAction(seedPageNosotrosHybrid, "Nosotros")} className="w-full bg-orange-100 text-orange-700 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-orange-200 hover:bg-orange-200">Configurar Página Nosotros</button>
        </div>
      </div>
    </div>
  );
}
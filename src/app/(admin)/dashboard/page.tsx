// src/app/(admin)/dashboard/page.tsx
"use client";
import { useState } from "react";
import { 
  seedSectionsAdmin, 
  seedClassesAdmin, 
  seedNewsAdmin,
  seedPageNosotrosHybrid,
  seedPageInicioConSlider // <-- Importamos la nueva función
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
    <div className="p-10 space-y-10 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Admin Control Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* CARGA DE DATOS REALES */}
        <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Contenido Global</h2>
          <button onClick={() => runAction(seedSectionsAdmin, "Estructura de Secciones")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest">1. Cargar Secciones Base</button>
          <button onClick={() => runAction(seedClassesAdmin, "Clases Cargadas")} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest">2. Cargar Clases</button>
          <button onClick={() => runAction(seedNewsAdmin, "Noticias Cargadas")} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest">3. Cargar Noticias</button>
        </div>

        {/* PRUEBAS DE PÁGINAS HÍBRIDAS */}
        <div className="p-8 bg-white rounded-[2rem] border border-orange-200 shadow-sm space-y-4">
          <h2 className="font-bold text-orange-600 uppercase text-xs tracking-widest text-center">Configuración de Páginas</h2>
          
          <button 
            onClick={() => runAction(seedPageInicioConSlider, "Inicio con Slider configurado")} 
            className="w-full bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50"
          >
            Configurar Inicio (Con Slider)
          </button>

          <button 
            onClick={() => runAction(seedPageNosotrosHybrid, "Página Nosotros creada")} 
            className="w-full bg-orange-100 text-orange-700 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-orange-200 border border-orange-200"
          >
            Configurar Nosotros (Imagen/Texto)
          </button>

          <div className="flex gap-2">
            <a href="/" target="_blank" className="flex-1 text-center bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest">Ver Inicio</a>
            <a href="/nosotros" target="_blank" className="flex-1 text-center bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-[9px] uppercase tracking-widest">Ver Nosotros</a>
          </div>
        </div>

      </div>
    </div>
  );
}
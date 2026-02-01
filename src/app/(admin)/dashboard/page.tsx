// src/app/(admin)/dashboard/page.tsx
"use client";
import { useState } from "react";
import { 
  savePageConfigAdmin, 
  seedSectionsAdmin, 
  seedClassesAdmin, 
  seedNewsAdmin,
  seedPageNosotrosHybrid 
} from "@/services/admin-services";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);

  const runAction = async (action: () => Promise<{success: boolean, error?: any}>, msg: string) => {
    setLoading(true);
    try {
      const res = await action();
      setLoading(false);
      if (res.success) alert(`✅ Éxito: ${msg}`);
      else alert(`❌ Error: ${JSON.stringify(res.error)}`);
    } catch (err) {
      setLoading(false);
      alert(`💥 Error crítico: ${err}`);
    }
  };

  return (
    <div className="p-10 space-y-10 bg-slate-50 min-h-screen">
      <header className="space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
          Admin Panel <span className="text-orange-500 text-base font-medium tracking-normal ml-2">v2.0 Híbrido</span>
        </h1>
        <p className="text-slate-500 text-sm">Gestión de arquitectura modular y carga de datos dinámicos.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 1. CONFIGURACIÓN ESTRUCTURAL */}
        <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-black text-slate-800 uppercase text-xs tracking-widest">1. Estructura Base</h2>
            <p className="text-[10px] text-slate-400 italic">Configura slugs y secciones globales iniciales.</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => runAction(seedSectionsAdmin, "Secciones Globales Creadas")} 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
            >
              Cargar Secciones Globales
            </button>
            <button 
              onClick={() => runAction(() => savePageConfigAdmin("inicio", { 
                category: 'inicio',
                header_title: "Escuela de Música Barrial",
                sections: ["hero", "clases", "contacto", "noticias"] 
              }), "Página de Inicio vinculada")} 
              disabled={loading}
              className="w-full bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Vincular Página Inicio
            </button>
          </div>
        </div>

        {/* 2. CONTENIDO COMPARTIDO */}
        <div className="p-8 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-black text-green-600 uppercase text-xs tracking-widest">2. Contenido Global</h2>
            <p className="text-[10px] text-slate-400 italic">Data que se refleja en todas las páginas.</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => runAction(seedClassesAdmin, "Colección de Clases actualizada")} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-100"
            >
              Cargar Clases (Real)
            </button>
            <button 
              onClick={() => runAction(seedNewsAdmin, "Colección de Noticias actualizada")} 
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-orange-100"
            >
              Cargar Noticias
            </button>
          </div>
        </div>

        {/* 3. LABORATORIO HÍBRIDO */}
        <div className="p-8 bg-orange-50 rounded-[2rem] border border-orange-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-black text-orange-700 uppercase text-xs tracking-widest text-center">🧪 Laboratorio Dinámico</h2>
            <p className="text-[10px] text-orange-600/60 text-center">Prueba secciones con data única (Objetos) vs globales (Strings).</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/50 p-4 rounded-xl border border-orange-100">
              <p className="text-[9px] text-orange-800 leading-tight">
                <strong>Nosotros:</strong> Hero con título propio + Bloque Texto/Imagen + Clases (Global).
              </p>
            </div>
            
            <button 
              onClick={() => runAction(seedPageNosotrosHybrid, "Página Nosotros (Híbrida) Creada")} 
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-orange-200"
            >
              Generar Página "Nosotros"
            </button>
            
            <a 
              href="/nosotros" 
              target="_blank" 
              className="block text-center w-full text-orange-700 font-bold text-[10px] uppercase tracking-widest hover:underline"
            >
              Ver resultado en vivo ↗
            </a>
          </div>
        </div>

      </div>

      <footer className="pt-10 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Escuela de Música Barrial • Sistema de Gestión de Contenidos</p>
      </footer>
    </div>
  );
}
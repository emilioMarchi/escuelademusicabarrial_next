"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDirtyState } from "@/context/DirtyStateContext";
import { 
  LayoutDashboard, ChevronDown, ChevronRight, 
  LogOut, AlertCircle, Layers 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const pages = [
  { name: "Inicio", path: "/dashboard/inicio" },
  { name: "Nosotros", path: "/dashboard/nosotros" },
  { name: "Clases", path: "/dashboard/clases" },
  { name: "Novedades", path: "/dashboard/novedades" },
  { name: "Contacto", path: "/dashboard/contacto" },
  { name: "Donaciones", path: "/dashboard/como-ayudar" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDirty, setDirty } = useDirtyState();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  
  // Estado para controlar el submenú de páginas
  const [pagesOpen, setPagesOpen] = useState(true);

  // Efecto para mantener abierto el menú si estamos en una subpágina
  useEffect(() => {
    if (pages.some(p => p.path === pathname)) {
      setPagesOpen(true);
    }
  }, [pathname]);

  const handleNavigation = (path: string) => {
    if (isDirty && pathname !== path) {
      setPendingPath(path);
    } else {
      router.push(path);
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl">E</span>
          </div>
          <span className="font-black uppercase tracking-tighter text-xl text-slate-900">EMB Admin</span>
        </div>

        <nav className="space-y-2">
          {/* BOTÓN DASHBOARD PRINCIPAL */}
          <button
            onClick={() => handleNavigation("/dashboard")}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              pathname === "/dashboard" 
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>

          {/* MENÚ COLAPSABLE DE PÁGINAS */}
          <div className="space-y-1">
            <button
              onClick={() => setPagesOpen(!pagesOpen)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                pages.some(p => p.path === pathname) 
                  ? "text-slate-900 bg-slate-50" 
                  : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers size={18} />
                Páginas
              </div>
              {pagesOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            <AnimatePresence>
              {pagesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 space-y-1 mt-1 border-l-2 border-slate-50 ml-7">
                    {pages.map((page) => (
                      <button
                        key={page.path}
                        onClick={() => handleNavigation(page.path)}
                        className={`w-full flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                          pathname === page.path
                            ? "text-slate-900 bg-white"
                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Detalle tipo item (bolita) */}
                        <div className={`w-1.5 h-1.5 rounded-full transition-all ${
                          pathname === page.path ? "bg-green-500 scale-125" : "bg-slate-200"
                        }`} />
                        {page.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-4">
        <button 
          onClick={() => { /* Lógica logout */ }}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>

      {/* MODAL DE ADVERTENCIA (Mantiene la lógica anterior) */}
      <AnimatePresence>
        {pendingPath && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase text-slate-900 leading-tight mb-2">Cambios sin guardar</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">Si sales ahora perderás las ediciones realizadas en esta página.</p>
              <div className="space-y-3">
                <button 
                  onClick={() => setPendingPath(null)} 
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Permanecer y Guardar
                </button>
                <button 
                  onClick={() => {
                    setDirty(false);
                    const path = pendingPath;
                    setPendingPath(null);
                    router.push(path);
                  }} 
                  className="w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all"
                >
                  Salir de todas formas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}
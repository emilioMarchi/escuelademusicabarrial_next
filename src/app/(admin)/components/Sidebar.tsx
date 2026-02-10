"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDirtyState } from "@/context/DirtyStateContext";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, ChevronDown, ChevronRight, 
  LogOut, AlertCircle, Layers, DollarSign, Image as ImageIcon 
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
  const { logout } = useAuth();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  
  // Ajustado para que comience cerrado
  const [pagesOpen, setPagesOpen] = useState(false);

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

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-8 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xl">E</span>
          </div>
          <span className="font-black uppercase tracking-tighter text-xl text-slate-900">EMB Admin</span>
        </div>

        <nav className="space-y-2 flex-1">
          {/* Dashboard */}
          <button 
            onClick={() => handleNavigation("/dashboard")}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all
              ${pathname === "/dashboard" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50"}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          {/* Balances */}
          <button 
            onClick={() => handleNavigation("/dashboard/balances")}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all
              ${pathname === "/dashboard/balances" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50"}`}
          >
            <DollarSign size={18} /> Balances
          </button>

          {/* Galería - Botón Independiente */}
          <button 
            onClick={() => handleNavigation("/dashboard/galeria")}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all
              ${pathname === "/dashboard/galeria" ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50"}`}
          >
            <ImageIcon size={18} /> Galería
          </button>

          {/* Menú de Páginas */}
          <div className="space-y-1">
            <button 
              onClick={() => setPagesOpen(!pagesOpen)}
              className="w-full flex items-center justify-between px-6 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
            >
              <div className="flex items-center gap-4">
                <Layers size={18} /> Páginas
              </div>
              <motion.div animate={{ rotate: pagesOpen ? 180 : 0 }}>
                <ChevronDown size={14} />
              </motion.div>
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
                        className={`w-full text-left px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all
                          ${pathname === page.path ? "text-slate-900 bg-slate-50" : "text-slate-400 hover:text-slate-600"}`}
                      >
                        {page.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Cerrar Sesión */}
        <div className="pt-6 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Modal de cambios pendientes */}
      <AnimatePresence>
        {pendingPath && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-10 rounded-[3rem] max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase text-slate-900 leading-tight mb-2">Cambios sin guardar</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">Si sales ahora perderás las ediciones realizadas.</p>
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
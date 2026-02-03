"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDirtyState } from "@/context/DirtyStateContext";
import { 
  LayoutDashboard, Home, Users, Music, Newspaper, 
  Mail, Heart, LogOut, AlertCircle, X 
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Inicio", path: "/dashboard/inicio", icon: Home },
  { name: "Nosotros", path: "/dashboard/nosotros", icon: Users },
  { name: "Clases", path: "/dashboard/clases", icon: Music },
  { name: "Novedades", path: "/dashboard/novedades", icon: Newspaper },
  { name: "Contacto", path: "/dashboard/contacto", icon: Mail },
  { name: "Donaciones", path: "/dashboard/como-ayudar", icon: Heart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDirty, setDirty } = useDirtyState();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const handleNavigation = (path: string) => {
    if (isDirty && pathname !== path) {
      setPendingPath(path);
    } else {
      router.push(path);
    }
  };

  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col h-full border-r border-slate-900 flex-shrink-0 relative">
      <div className="p-8 pb-4">
        <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" /> EMB
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Admin Panel</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all ${
              pathname === item.path ? "bg-slate-800 text-white shadow-lg" : "text-slate-400 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <item.icon size={18} className={pathname === item.path ? "text-green-400" : "text-slate-500"} />
            {item.name}
          </button>
        ))}
      </nav>

      {/* MODAL DE ADVERTENCIA */}
      {pendingPath && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase text-slate-900 leading-tight mb-2">Cambios sin guardar</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Si sales ahora perderás las ediciones realizadas en esta página.</p>
            <div className="space-y-3">
              <button onClick={() => setPendingPath(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Permanecer y Guardar</button>
              <button onClick={() => { setDirty(false); router.push(pendingPath); setPendingPath(null); }} className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-all">Ignorar y Salir</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
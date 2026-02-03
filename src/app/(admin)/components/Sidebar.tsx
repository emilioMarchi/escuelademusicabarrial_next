"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Music, 
  Newspaper, 
  Mail, 
  Heart,
  LogOut
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

  return (
    <aside className="w-64 bg-slate-950 text-white flex flex-col h-full border-r border-slate-900 flex-shrink-0">
      {/* Header del Sidebar */}
      <div className="p-8 pb-4">
        <h2 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
          <span className="text-green-500 text-3xl leading-none">.</span>EMB
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 ml-3">Admin Panel</p>
      </div>
      
      {/* Navegación Principal */}
      <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all group ${
                isActive
                  ? "bg-slate-800 text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon 
                size={18} 
                className={`transition-colors ${isActive ? "text-green-400" : "text-slate-500 group-hover:text-white"}`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-6 border-t border-slate-900">
        <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors w-full px-2">
          <LogOut size={14} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
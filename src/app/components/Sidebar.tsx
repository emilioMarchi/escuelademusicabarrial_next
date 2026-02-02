"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Herramientas Técnicas", path: "/dashboard", icon: "🛠️" },
  { name: "Página Inicio", path: "/dashboard/inicio", icon: "🏠" },
  { name: "Página Nosotros", path: "/dashboard/nosotros", icon: "👥" },
  { name: "Gestión de Clases", path: "/dashboard/clases", icon: "🎹" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen p-6">
      <div className="mb-10">
        <h2 className="text-xl font-black tracking-tighter text-green-400 italic">EMB ADMIN</h2>
      </div>
      
      <nav className="flex-1 space-y-2">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">Gestión de Contenido</p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              pathname === item.path ? "bg-green-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            <span>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="pt-6 border-t border-slate-800">
        <Link href="/" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">
          ← Volver al sitio
        </Link>
      </div>
    </aside>
  );
}
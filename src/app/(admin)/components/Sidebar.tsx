"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Inicio", path: "/dashboard/inicio", icon: "🏠" },
  { name: "Nosotros", path: "/dashboard/nosotros", icon: "👥" },
  { name: "Clases", path: "/dashboard/clases", icon: "🎹" },
  { name: "Novedades", path: "/dashboard/novedades", icon: "📰" },
  { name: "Contacto", path: "/dashboard/contacto", icon: "✉️" },
  { name: "Donaciones", path: "/dashboard/como-ayudar", icon: "🎁" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col min-h-screen p-8">
      <h2 className="text-2xl font-black tracking-tighter text-green-400 italic mb-12">EMB ADMIN</h2>
      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${
              pathname === item.path ? "bg-green-600 text-white shadow-lg shadow-green-900/40" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
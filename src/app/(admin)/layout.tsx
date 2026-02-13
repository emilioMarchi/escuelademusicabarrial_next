"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import { DirtyStateProvider } from "@/context/DirtyStateContext";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Sincronizando...
        </p>
      </div>
    );
  }

  return (
    <DirtyStateProvider>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative">
        
        {/* SIDEBAR CONTAINER: Maneja el deslizamiento en mobile */}
        <div className={`
          fixed inset-y-0 left-0 z-[100] w-72 bg-white transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* OVERLAY: Tapar el contenido cuando el sidebar está abierto en mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 h-full overflow-y-auto flex flex-col">
          
          {/* HEADER MOBILE: Solo visible en pantallas chicas */}
          <header className="lg:hidden flex items-center justify-between p-6 bg-white border-b border-slate-100 shrink-0 sticky top-0 z-30">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">E</div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Admin</span>
             </div>
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2 text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
             >
               <Menu size={24} />
             </button>
          </header>

          <div className="p-6 md:p-12 max-w-6xl mx-auto pb-32 w-full">
            {children}
          </div>
        </main>
      </div>
    </DirtyStateProvider>
  );
}
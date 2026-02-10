"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import { DirtyStateProvider } from "@/context/DirtyStateContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Si está cargando o no hay usuario, mostramos un div neutro que NO rompa el layout
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
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto">
          <div className="p-8 md:p-12 max-w-6xl mx-auto pb-32">
            {children}
          </div>
        </main>
      </div>
    </DirtyStateProvider>
  );
}
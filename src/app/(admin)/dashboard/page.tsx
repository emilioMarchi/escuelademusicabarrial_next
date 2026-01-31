// src/app/(admin)/dashboard/page.tsx
"use client";
import { useState } from "react";
import { savePageConfigAdmin, seedSectionsAdmin } from "@/services/admin-services";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);

  const handleInitPage = async () => {
    setLoading(true);
    const result = await savePageConfigAdmin("inicio", {
      header_title: "Escuela de Música Barrial",
      header_description: "Cultura y música en el corazón del barrio.",
      sections: ["hero", "noticias", "contacto"]
    });
    setLoading(false);
    if (result.success) alert("Página 'inicio' vinculada.");
  };

  const handleFixSections = async () => {
    setLoading(true);
    const result = await seedSectionsAdmin();
    setLoading(false);
    if (result.success) alert("Secciones resubidas con el tipado correcto.");
    else alert("Error al resubir.");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-black mb-8 uppercase tracking-tighter">Admin Panel</h1>
      
      <div className="flex flex-col gap-4 max-w-sm">
        <button 
          onClick={handleInitPage}
          disabled={loading}
          className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all"
        >
          1. Vincular IDs en 'Pages'
        </button>

        <button 
          onClick={handleFixSections}
          disabled={loading}
          className="bg-orange-500 text-white px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-100"
        >
          2. Corregir y Resubir 'Sections'
        </button>
      </div>
    </div>
  );
}
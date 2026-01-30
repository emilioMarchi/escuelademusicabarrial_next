// src/app/(admin)/dashboard/page.tsx
"use client";
import { savePageConfigAdmin } from "@/services/admin-services";

export default function AdminDashboard() {
  const handleInit = async () => {
    const result = await savePageConfigAdmin("inicio", {
      header_title: "Escuela de Música Barrial",
      header_description: "Cultura y música en el corazón del barrio.",
      sections: ["hero", "noticias", "contacto"]
    });

    if (result.success) alert("Base de datos conectada y página creada");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <button 
        onClick={handleInit}
        className="bg-black text-white px-6 py-2 rounded"
      >
        Testear Conexión Admin y Crear Home
      </button>
    </div>
  );
}
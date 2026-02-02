"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData } from "@/types";
// IMPORTANTE: Usamos savePageConfigAdmin para guardar TODO el objeto
import { getPageAdmin, savePageConfigAdmin } from "@/services/admin-services";
import SectionForm from "@/app/(admin)/components/SectionForm";
import { Globe, Save } from "lucide-react";

export default function PageEditor() {
  const { slug } = useParams();
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPageAdmin(slug as string).then(res => {
      if (res.success) setPage(res.data);
      setLoading(false);
    });
  }, [slug]);

  // FUNCIÓN CORREGIDA: Actualización inmutable para que el switch reaccione
  const handleSectionUpdate = (index: number, updatedContent: any, updatedSettings?: any) => {
    if (!page) return;

    const newSections = [...page.sections];
    // Creamos un nuevo objeto para la sección específica
    newSections[index] = {
      ...(newSections[index] as SectionData),
      content: updatedContent,
      settings: updatedSettings || (newSections[index] as SectionData).settings
    };

    setPage({ ...page, sections: newSections });
  };

  const handleRootUpdate = (field: string, value: string) => {
    if (!page) return;
    setPage({ ...page, [field]: value });
  };

  const saveChanges = async () => {
    if (!page) return;
    // Ahora enviamos el objeto 'page' completo para guardar Meta Tags y Secciones
    const res = await savePageConfigAdmin(slug as string, page);
    if (res.success) alert("¡Página y SEO publicados con éxito!");
    else alert("Error al guardar");
  };

  if (loading) return <div className="p-20 font-black animate-pulse text-center uppercase">Sincronizando...</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Editor: {slug}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 ml-1">Gestión de contenido y SEO</p>
        </div>
        <button 
          onClick={saveChanges}
          className="bg-green-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-900/20 active:scale-95 transition-all flex items-center gap-3"
        >
          <Save size={16} /> Publicar Cambios
        </button>
      </header>

      {/* BLOQUE SEO */}
      <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
          <div className="p-3 bg-slate-900 text-white rounded-2xl"><Globe size={20} /></div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest">Configuración SEO</h2>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Configura cómo aparece la página en buscadores</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Título SEO (Meta Title)</label>
            <input 
              type="text"
              value={page?.meta_title || ""}
              onChange={(e) => handleRootUpdate('meta_title', e.target.value)}
              className="w-full p-5 bg-slate-50 rounded-[2rem] border-none font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 shadow-inner"
              placeholder="Ej: Escuela de Música Barrial - Nosotros"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Descripción SEO (Meta Description)</label>
            <input 
              type="text"
              value={page?.meta_description || ""}
              onChange={(e) => handleRootUpdate('meta_description', e.target.value)}
              className="w-full p-5 bg-slate-50 rounded-[2rem] border-none font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 shadow-inner"
              placeholder="Ej: Conocé nuestra historia y profesores..."
            />
          </div>
        </div>
      </div>

      {/* LISTADO DE SECCIONES */}
      <div className="space-y-8">
        {page?.sections.map((section, idx) => (
          <div key={idx} className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 group-hover:bg-green-500 transition-colors" />
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                Bloque {idx + 1}: {(section as SectionData).type || section}
              </span>
            </div>
            
            <SectionForm 
              section={section as SectionData} 
              onChange={(newContent, newSettings) => handleSectionUpdate(idx, newContent, newSettings)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
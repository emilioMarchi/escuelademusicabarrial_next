"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData } from "@/types";
import { getPageAdmin, savePageConfigAdmin } from "@/services/admin-services";
import SectionForm from "../../components/SectionForm";
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

  const handleSectionUpdate = (index: number, updatedContent: any, updatedSettings?: any) => {
    if (!page) return;
    const newSections = [...page.sections];
    newSections[index] = {
      ...(newSections[index] as SectionData),
      content: updatedContent,
      settings: updatedSettings || (newSections[index] as SectionData).settings
    };
    setPage({ ...page, sections: newSections });
  };

  const saveChanges = async () => {
    if (!page) return;
    const res = await savePageConfigAdmin(slug as string, page);
    if (res.success) alert("¡Página y SEO publicados!");
  };

  if (loading) return <div className="p-20 font-black animate-pulse text-center uppercase tracking-widest">Sincronizando...</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Editor: {slug}</h1>
        </div>
        <button onClick={saveChanges} className="bg-green-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3">
          <Save size={16} /> Publicar Cambios
        </button>
      </header>

      {/* BLOQUE SEO */}
      <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
          <Globe className="text-slate-900" size={20} />
          <h2 className="text-xs font-black uppercase tracking-widest">Configuración SEO</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Título Meta</label>
            <input 
              type="text" 
              value={page?.meta_title || ""} 
              onChange={(e) => setPage({ ...page!, meta_title: e.target.value })}
              className="w-full p-5 bg-slate-50 rounded-[2rem] border-none font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 italic">Descripción Meta</label>
            <input 
              type="text" 
              value={page?.meta_description || ""} 
              onChange={(e) => setPage({ ...page!, meta_description: e.target.value })}
              className="w-full p-5 bg-slate-50 rounded-[2rem] border-none font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {page?.sections.map((section, idx) => (
          <div key={idx} className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-8 block w-fit">
              Bloque {idx + 1}: {(section as SectionData).type || section}
            </span>
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
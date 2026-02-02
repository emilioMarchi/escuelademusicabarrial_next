"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData } from "@/types";
import { getPageAdmin, updatePageSectionsAdmin } from "@/services/admin-services";
import SectionForm from "@/app/components/SectionForm";

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

  const handleSectionUpdate = (index: number, updatedContent: any) => {
    if (!page) return;
    const newSections = [...page.sections] as SectionData[];
    newSections[index].content = updatedContent;
    setPage({ ...page, sections: newSections });
  };

  const saveChanges = async () => {
    if (!page) return;
    const res = await updatePageSectionsAdmin(slug as string, page.sections);
    if (res.success) alert("¡Página actualizada!");
  };

  if (loading) return <div className="p-20 font-black animate-pulse">Cargando datos...</div>;

  return (
    <div className="space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Editor: {slug}</h1>
        <button 
          onClick={saveChanges}
          className="bg-green-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-900/20 active:scale-95 transition-all"
        >
          Publicar Cambios
        </button>
      </header>

      <div className="space-y-8">
        {page?.sections.map((section, idx) => (
          <div key={idx} className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                Bloque {idx + 1}: {(section as SectionData).type}
              </span>
            </div>
            
            <SectionForm 
              section={section as SectionData} 
              onChange={(newContent) => handleSectionUpdate(idx, newContent)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
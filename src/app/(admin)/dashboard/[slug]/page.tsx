"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData, SectionType, Class, News } from "@/types";
import { 
  getPageAdmin, 
  savePageConfigAdmin, 
  getCollectionAdmin, 
  upsertItemAdmin, 
  deleteItemAdmin 
} from "@/services/admin-services"
import SectionForm from "../../components/SectionForm";
import { Globe, Save, GripVertical, Trash2, Plus, Layout, BookOpen, Newspaper, MessageSquare } from "lucide-react";
import { Reorder, AnimatePresence } from "framer-motion";

export default function PageEditor() {
  const { slug } = useParams();
  const [page, setPage] = useState<PageContent | null>(null);
  const [dbItems, setDbItems] = useState<{clases: Class[], noticias: News[]}>({ clases: [], noticias: [] });
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    const [pageRes, clasesRes, newsRes] = await Promise.all([
      getPageAdmin(slug as string),
      getCollectionAdmin("clases"),
      getCollectionAdmin("noticias")
    ]);

    if (pageRes.success) setPage(pageRes.data);
    setDbItems({
      clases: clasesRes.success ? clasesRes.data : [],
      noticias: newsRes.success ? newsRes.data : []
    });
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, [slug]);

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

  const handleReorder = (newOrder: any[]) => {
    if (!page) return;
    setPage({ ...page, sections: newOrder });
  };

  const addSection = (type: SectionType, initialSettings: any = {}) => {
    if (!page) return;
    const newSection: SectionData = {
      id: `${type}-${Date.now()}`,
      type: type,
      content: { title: "Nueva Sección", description: "Descripción..." },
      settings: { layout: 'grid', ...initialSettings }
    };
    setPage({ ...page, sections: [...page.sections, newSection] });
  };

  const saveChanges = async () => {
    if (!page) return;
    const res = await savePageConfigAdmin(slug as string, page);
    if (res.success) alert("¡Cambios publicados!");
  };

  if (loading) return <div className="p-20 font-black animate-pulse text-center uppercase tracking-widest">Sincronizando...</div>;

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Editor: {slug}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1 ml-1">Page Builder Activo</p>
        </div>
        <button onClick={saveChanges} className="bg-green-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2">
          <Save size={14} /> Publicar Cambios
        </button>
      </header>

      {/* SEO */}
      <div className="p-7 bg-white rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
          <Globe className="text-slate-900" size={18} />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500">SEO & Meta Tags</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" value={page?.meta_title || ""} onChange={(e) => setPage({ ...page!, meta_title: e.target.value })} className="p-4 bg-slate-50 rounded-xl border-none font-bold text-sm" placeholder="Título SEO" />
          <input type="text" value={page?.meta_description || ""} onChange={(e) => setPage({ ...page!, meta_description: e.target.value })} className="p-4 bg-slate-50 rounded-xl border-none font-medium text-sm" placeholder="Descripción SEO" />
        </div>
      </div>

      {/* AGREGAR SECCIONES */}
      <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-green-400 ml-2">Añadir Módulos</h3>
        <div className="flex flex-wrap gap-3 text-white">
          <button onClick={() => addSection('hero')} className="bg-slate-800 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2"><Plus size={12}/> Hero</button>
          <button onClick={() => addSection('texto-bloque')} className="bg-slate-800 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2"><Plus size={12}/> Texto/Imagen</button>
          <button onClick={() => addSection('clases', { layout: 'slider' })} className="bg-slate-800 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2"><BookOpen size={12}/> Clases</button>
          <button onClick={() => addSection('noticias', { layout: 'grid' })} className="bg-slate-800 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2"><Newspaper size={12}/> Noticias</button>
          <button onClick={() => addSection('contacto')} className="bg-blue-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2"><MessageSquare size={12}/> Contacto</button>
        </div>
      </div>

      <Reorder.Group axis="y" values={page?.sections || []} onReorder={handleReorder} className="space-y-4">
        <AnimatePresence>
          {page?.sections.map((section, idx) => {
            const s = section as SectionData;
            return (
              <Reorder.Item key={s.id || idx} value={section} className="relative group">
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-900 transition-opacity opacity-0 group-hover:opacity-100"><GripVertical size={20} /></div>
                <div className="p-7 bg-white rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
                  <div className="flex justify-between items-center mb-5 border-b border-slate-50 pb-3">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5"><Layout size={10} /> {s.type}</span>
                    <button onClick={() => { if(confirm("¿Eliminar bloque?")) setPage({...page!, sections: page!.sections.filter((_,i) => i !== idx)})}} className="text-slate-200 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                  <SectionForm 
                    section={s} 
                    items={s.type === 'clases' || s.type === 'noticias' ? dbItems[s.type as 'clases' | 'noticias'] : []}
                    onChange={(c, sett) => handleSectionUpdate(idx, c, sett)}
                    onUpsertItem={(item) => { upsertItemAdmin(s.type as any, item).then(() => refreshData()) }}
                    onDeleteItem={(id) => { if(confirm("¿Eliminar?")) deleteItemAdmin(s.type as any, id).then(() => refreshData()) }}
                  />
                </div>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}
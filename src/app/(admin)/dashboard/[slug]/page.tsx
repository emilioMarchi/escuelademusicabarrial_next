"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData, SectionType, Class, News } from "@/types";
import { 
  getPageAdmin, 
  savePageConfigAdmin, 
  getCollectionAdmin, 
  upsertItemAdmin, 
  deleteItemAdmin,
  getInstrumentsAdmin,
  updateInstrumentsAdmin
} from "@/services/admin-services";
import SectionForm from "../../components/SectionForm";
import { Save, Layout, GripVertical, Trash2, Plus, Type, Image as ImageIcon, MessageSquare, BookOpen, Newspaper } from "lucide-react";
import { Reorder, AnimatePresence } from "framer-motion";

export default function PageEditor() {
  const { slug } = useParams();
  const [page, setPage] = useState<PageContent | null>(null);
  const [dbItems, setDbItems] = useState<{clases: Class[], noticias: News[], instruments: string[]}>({ 
    clases: [], noticias: [], instruments: [] 
  });
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    const [pageRes, clasesRes, newsRes, instRes] = await Promise.all([
      getPageAdmin(slug as string),
      getCollectionAdmin("clases"),
      getCollectionAdmin("noticias"),
      getInstrumentsAdmin()
    ]);
    if (pageRes.success) setPage(pageRes.data);
    setDbItems({
      clases: clasesRes.success ? (clasesRes.data as Class[]) : [],
      noticias: newsRes.success ? (newsRes.data as News[]) : [],
      instruments: instRes.success ? (instRes.data as string[]) : []
    });
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, [slug]);

  const addSection = (type: SectionType) => {
    if (!page) return;
    const newSection: SectionData = {
        id: `${type}-${Date.now()}`,
        type: type,
        content: { title: "Nuevo Bloque", description: "Descripción..." },
        settings: { layout: 'image-left' } // Default
    };
    if (type === 'hero') {
        newSection.content.slides = [{ image_url: "", title: "Nuevo Banner", description: "" }];
        newSection.settings!.layout = 'slider';
    }
    setPage({ ...page, sections: [...page.sections, newSection] });
  };

  if (loading) return <div className="p-20 font-black animate-pulse text-center uppercase tracking-widest text-slate-400">Cargando Editor...</div>;

  return (
    <div className="space-y-8 pb-32">
      {/* --- HEADER EDITOR --- */}
      <header className="flex justify-between items-end bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Editor: {slug}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Configuración de Página</p>
        </div>
        <button 
          onClick={() => savePageConfigAdmin(slug as string, page!).then(() => alert("¡Guardado!"))} 
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-900/20 transition-all hover:bg-green-500 active:scale-95 flex items-center gap-2"
        >
          <Save size={14} /> Publicar
        </button>
      </header>

      {/* --- CONFIGURACIÓN DE PÁGINA (SEO & HEADER) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200">
         <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 ml-2">Cabecera de Página (Público)</h3>
            <div className="space-y-2">
                <input type="text" placeholder="Título Principal (H1)" value={page?.header_title || ""} onChange={(e) => setPage({...page!, header_title: e.target.value})} className="w-full p-4 bg-white rounded-2xl border-none font-bold text-slate-900 shadow-sm" />
                <textarea rows={2} placeholder="Descripción Corta" value={page?.header_description || ""} onChange={(e) => setPage({...page!, header_description: e.target.value})} className="w-full p-4 bg-white rounded-2xl border-none text-xs text-slate-600 shadow-sm" />
            </div>
         </div>
         <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 ml-2">SEO (Google)</h3>
            <div className="space-y-2">
                <input type="text" placeholder="Meta Title" value={page?.meta_title || ""} onChange={(e) => setPage({...page!, meta_title: e.target.value})} className="w-full p-4 bg-white rounded-2xl border-none font-bold text-slate-900 shadow-sm" />
                <input type="text" placeholder="Meta Description" value={page?.meta_description || ""} onChange={(e) => setPage({...page!, meta_description: e.target.value})} className="w-full p-4 bg-white rounded-2xl border-none text-xs text-slate-600 shadow-sm" />
            </div>
         </div>
      </div>

      {/* --- BARRA DE HERRAMIENTAS: AGREGAR SECCIÓN --- */}
      <div className="p-6 bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-wrap gap-4 items-center justify-center">
         <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mr-2">Agregar Bloque:</span>
         
         <button onClick={() => addSection('hero')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase hover:bg-slate-700 transition-all border border-slate-700">
            <ImageIcon size={12} /> Hero/Banner
         </button>
         <button onClick={() => addSection('texto-bloque')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase hover:bg-slate-700 transition-all border border-slate-700">
            <Type size={12} /> Texto + Imagen
         </button>
         <button onClick={() => addSection('clases')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase hover:bg-slate-700 transition-all border border-slate-700">
            <BookOpen size={12} /> Grilla Clases
         </button>
         <button onClick={() => addSection('noticias')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase hover:bg-slate-700 transition-all border border-slate-700">
            <Newspaper size={12} /> Noticias
         </button>
         <button onClick={() => addSection('contacto')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50">
            <MessageSquare size={12} /> Formulario
         </button>
      </div>

      {/* --- LISTA DE SECCIONES --- */}
      <Reorder.Group axis="y" values={page?.sections || []} onReorder={(newOrder) => setPage({ ...page!, sections: newOrder })} className="space-y-8">
        <AnimatePresence>
          {page?.sections.map((section, idx) => {
            if (!section || typeof section === 'string') return null;
            const s = section as SectionData;

            return (
              <Reorder.Item key={s.id || idx} value={section} className="relative group">
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100 hidden lg:block">
                  <GripVertical size={24} />
                </div>

                <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
                    <span className="bg-slate-900 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                      <Layout size={12} /> Bloque: {s.type}
                    </span>
                    <button 
                      onClick={() => { if(confirm("¿Eliminar bloque?")) setPage({...page!, sections: page!.sections.filter((_,i) => i !== idx)}) }} 
                      className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <SectionForm 
                    section={section} 
                    items={s.type === 'clases' ? dbItems.clases : s.type === 'noticias' ? dbItems.noticias : []}
                    instruments={dbItems.instruments}
                    onUpdateInstruments={(list) => updateInstrumentsAdmin(list).then(refreshData)}
                    onChange={(newContent, newSettings) => {
                      const newSections = [...page!.sections];
                      newSections[idx] = { ...s, content: newContent, settings: newSettings || s.settings };
                      setPage({ ...page!, sections: newSections });
                    }}
                    onUpsertItem={(item) => upsertItemAdmin((section as SectionData).type as any, item).then(refreshData)}
                    onDeleteItem={(id) => deleteItemAdmin((section as SectionData).type as any, id).then(refreshData)}
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
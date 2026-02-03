"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData, SectionType, Class, News } from "@/types";
import { 
  getPageAdmin, savePageConfigAdmin, getCollectionAdmin, 
  upsertItemAdmin, deleteItemAdmin, 
  getInstrumentsAdmin, updateInstrumentsAdmin,
  getTeachersAdmin, updateTeachersAdmin
} from "@/services/admin-services";
import SectionForm from "../../components/SectionForm";
import { Save, Layout, GripVertical, Trash2, ImageIcon, Type, BookOpen, Newspaper, MessageSquare, Heading } from "lucide-react";
import { Reorder, AnimatePresence } from "framer-motion";

export default function PageEditor() {
  const { slug } = useParams();
  const [page, setPage] = useState<PageContent | null>(null);
  
  const [dbItems, setDbItems] = useState<{
    clases: Class[], noticias: News[], 
    instruments: string[], teachers: string[] 
  }>({ clases: [], noticias: [], instruments: [], teachers: [] });

  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    const [pageRes, clasesRes, newsRes, instRes, teachRes] = await Promise.all([
      getPageAdmin(slug as string),
      getCollectionAdmin("clases"),
      getCollectionAdmin("noticias"),
      getInstrumentsAdmin(),
      getTeachersAdmin()
    ]);

    if (pageRes.success) setPage(pageRes.data);
    
    setDbItems({
      clases: clasesRes.success ? (clasesRes.data as Class[]) : [],
      noticias: newsRes.success ? (newsRes.data as News[]) : [],
      instruments: instRes.success ? (instRes.data as string[]) : [],
      teachers: teachRes.success ? (teachRes.data as string[]) : []
    });
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, [slug]);

  const addSection = (type: any) => { // Usamos 'any' temporalmente para permitir 'header' si TS se queja
    if (!page) return;
    const newSection: SectionData = {
        id: `${type}-${Date.now()}`,
        type: type,
        content: { title: "Nuevo Bloque", description: "..." },
        settings: { layout: 'image-left' }
    };
    
    // Inits específicos
    if (type === 'hero') {
        newSection.content.slides = [{ image_url: "", title: "Nuevo Slide", description: "" }];
    }
    if (type === 'header') {
        newSection.content.title = "Título de Página";
        newSection.content.description = "Descripción corta...";
    }

    setPage({ ...page, sections: [...page.sections, newSection] });
  };

  if (loading) return <div className="p-20 font-black animate-pulse text-center uppercase tracking-widest text-slate-400">Cargando Editor...</div>;

  return (
    <div className="space-y-8 pb-32">
      <header className="flex justify-between items-end bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Editor: {slug}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Gestión de Contenido</p>
        </div>
        <button 
          onClick={() => savePageConfigAdmin(slug as string, page!).then(() => alert("¡Página Publicada!"))} 
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 hover:bg-green-500 active:scale-95 transition-all"
        >
          <Save size={14} /> Publicar Cambios
        </button>
      </header>
      
      {/* Configuración SEO Básica */}
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
         <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3">Configuración SEO (Google)</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input type="text" placeholder="Meta Title" value={page?.meta_title || ""} onChange={(e) => setPage({...page!, meta_title: e.target.value})} className="p-3 bg-white rounded-xl border-none text-sm font-bold text-slate-900 shadow-sm" />
             <input type="text" placeholder="Meta Description" value={page?.meta_description || ""} onChange={(e) => setPage({...page!, meta_description: e.target.value})} className="p-3 bg-white rounded-xl border-none text-xs text-slate-600 shadow-sm" />
         </div>
      </div>

      {/* --- TOOLBAR AGREGAR SECCIONES --- */}
      <div className="flex flex-wrap gap-3 justify-center bg-slate-900 p-4 rounded-2xl shadow-lg sticky top-4 z-40">
         <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest mr-2 self-center">Agregar Bloque:</span>
         
         {/* BOTÓN HEADER NUEVO */}
         <button onClick={()=>addSection('header')} className="px-3 py-2 bg-slate-800 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-slate-700 border border-slate-600 flex gap-2"><Heading size={10}/> Header</button>
         
         <div className="w-px h-6 bg-slate-700 mx-2 self-center"></div>

         <button onClick={()=>addSection('hero')} className="px-3 py-2 bg-slate-800 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-slate-700 border border-slate-700 flex gap-2"><ImageIcon size={10}/> Banner/Hero</button>
         <button onClick={()=>addSection('texto-bloque')} className="px-3 py-2 bg-slate-800 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-slate-700 border border-slate-700 flex gap-2"><Type size={10}/> Texto+Img</button>
         <button onClick={()=>addSection('clases')} className="px-3 py-2 bg-slate-800 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-slate-700 border border-slate-700 flex gap-2"><BookOpen size={10}/> Clases</button>
         <button onClick={()=>addSection('noticias')} className="px-3 py-2 bg-slate-800 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-slate-700 border border-slate-700 flex gap-2"><Newspaper size={10}/> Noticias</button>
         <button onClick={()=>addSection('contacto')} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-bold uppercase hover:bg-blue-500 flex gap-2"><MessageSquare size={10}/> Contacto</button>
      </div>

      <Reorder.Group axis="y" values={page?.sections || []} onReorder={(newOrder) => setPage({ ...page!, sections: newOrder })} className="space-y-8">
        <AnimatePresence>
          {page?.sections.map((section, idx) => {
            if (!section || typeof section === 'string') return null;
            const s = section as SectionData;

            return (
              <Reorder.Item key={s.id || idx} value={section} className="relative group">
                <div className="absolute -left-10 top-10 p-2 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                  <GripVertical size={24} />
                </div>

                <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                    <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Layout size={10} /> {s.type}
                    </span>
                    <button onClick={() => { if(confirm("¿Eliminar bloque?")) setPage({...page!, sections: page!.sections.filter((_,i) => i !== idx)}) }} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <SectionForm 
                    section={section} 
                    items={s.type === 'clases' ? dbItems.clases : s.type === 'noticias' ? dbItems.noticias : []}
                    instruments={dbItems.instruments}
                    teachers={dbItems.teachers}
                    onUpdateInstruments={(list) => updateInstrumentsAdmin(list).then(refreshData)}
                    onUpdateTeachers={(list) => updateTeachersAdmin(list).then(refreshData)}
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
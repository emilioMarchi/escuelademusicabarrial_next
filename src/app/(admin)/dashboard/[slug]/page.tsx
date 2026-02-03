"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData, SectionType } from "@/types";
import { getPageAdmin, savePageConfigAdmin, getCollectionAdmin, getInstrumentsAdmin, getTeachersAdmin } from "@/services/admin-services";
import { useDirtyState } from "@/context/DirtyStateContext";
import SectionForm from "../../components/SectionForm";
import { Save, RefreshCw, ChevronLeft, CheckCircle, Plus, Layout, Type, MessageSquare, Music, Newspaper, Heart, Trash2 } from "lucide-react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function PageEditor() {
  const { slug } = useParams();
  const { isDirty, setDirty } = useDirtyState();
  const [page, setPage] = useState<PageContent | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [showToast, setShowToast] = useState(false); 
  const [dbItems, setDbItems] = useState({ clases: [], noticias: [], instruments: [], teachers: [] });
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
      clases: clasesRes.success ? clasesRes.data : [],
      noticias: newsRes.success ? newsRes.data : [],
      instruments: instRes.success ? instRes.data : [],
      teachers: teachRes.success ? teachRes.data : []
    });
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, [slug]);

  const handleSavePage = async () => {
    if (!page) return;
    setIsSavingAll(true);
    const res = await savePageConfigAdmin(page.slug, page);
    if (res.success) {
      setDirty(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000); 
    }
    setIsSavingAll(false);
  };

  const addSection = (type: SectionType) => {
    if (!page) return;
    const newSection: SectionData = {
      id: `${type}-${Date.now()}`,
      type: type,
      content: {
        title: "Nueva Sección",
        description: "Contenido de ejemplo.",
        slides: type === 'hero' ? [] : undefined
      },
      settings: { 
        layout: type === 'texto-bloque' ? 'image-right' : 'grid',
        form_type: type === 'contacto' ? 'general' : undefined
      }
    };
    setPage({ ...page, sections: [...page.sections, newSection] });
    setDirty(true);
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><RefreshCw className="animate-spin text-slate-300" size={40} /></div>;

  return (
    <div className="space-y-8 relative pb-40">
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-8 py-5 rounded-[2rem] flex items-center gap-4 shadow-2xl border border-white/10">
            <div className="bg-green-500 p-2 rounded-full text-slate-900"><CheckCircle size={20} /></div>
            <p className="text-xs font-black uppercase tracking-widest">¡Guardado con éxito!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"><ChevronLeft size={20} className="text-slate-400" /></Link>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Editor: {page?.slug}</h1>
        </div>
        <button onClick={handleSavePage} disabled={isSavingAll} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          {isSavingAll ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Guardar Todo
        </button>
      </header>

      {/* BARRA DE AGREGAR BLOQUE (Arriba y Compacta) */}
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-center gap-2 overflow-x-auto">
        <span className="text-[9px] font-black uppercase text-slate-400 mr-2 tracking-widest shrink-0">+ Agregar:</span>
        {[
          { type: 'hero', icon: Layout, label: 'Hero' },
          { type: 'texto-bloque', icon: Type, label: 'Texto' },
          { type: 'clases', icon: Music, label: 'Clases' },
          { type: 'noticias', icon: Newspaper, label: 'Noticias' },
          { type: 'contacto', icon: MessageSquare, label: 'Contacto' },
          { type: 'donaciones', icon: Heart, label: 'Donar' }
        ].map((btn) => (
          <button key={btn.type} onClick={() => addSection(btn.type as SectionType)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-900 transition-all group shrink-0">
            <btn.icon size={14} className="text-slate-400 group-hover:text-slate-900" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">{btn.label}</span>
          </button>
        ))}
      </div>

      <Reorder.Group axis="y" values={page?.sections || []} onReorder={(newOrder) => { setPage({ ...page!, sections: newOrder }); setDirty(true); }} className="space-y-12">
        {page?.sections.map((section, idx) => {
          // Verificación de seguridad para evitar el error de 'id'
          if (!section || typeof section === 'string') return null;
          const s = section as SectionData;

          return (
            <Reorder.Item key={s.id} value={section}>
              <div className="relative group">
                <button onClick={() => { if(confirm("¿Eliminar bloque?")) setPage({...page!, sections: page!.sections.filter((_,i) => i !== idx)}); setDirty(true); }} className="absolute -right-4 -top-4 p-2 bg-white border border-slate-100 rounded-full text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10"><Trash2 size={16}/></button>
                <SectionForm 
                  section={s} 
                  items={s.type === 'clases' ? dbItems.clases : s.type === 'noticias' ? dbItems.noticias : []}
                  onSave={handleSavePage}
                  onChange={(newContent, newSettings) => {
                    const newSections = [...page!.sections];
                    newSections[idx] = { ...s, content: newContent, settings: newSettings };
                    setPage({ ...page!, sections: newSections });
                  }}
                />
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
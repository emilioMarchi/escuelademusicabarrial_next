"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData, Class, News } from "@/types";
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
import { Save, Layout, GripVertical, Trash2 } from "lucide-react";
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

  const handleSave = async () => {
    if (!page) return;
    const res = await savePageConfigAdmin(slug as string, page);
    if (res.success) alert("¡Página publicada!");
  };

  if (loading) return <div className="p-20 font-black animate-pulse text-center uppercase tracking-widest text-slate-400">Sincronizando...</div>;

  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Editor: {slug}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Gestión de Contenido</p>
        </div>
        <button onClick={handleSave} className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 active:scale-95 transition-all">
          <Save size={16} /> Publicar Cambios
        </button>
      </header>

      <Reorder.Group axis="y" values={page?.sections || []} onReorder={(newOrder) => setPage({ ...page!, sections: newOrder })} className="space-y-8">
        <AnimatePresence>
          {page?.sections.map((section, idx) => {
            if (!section || typeof section === 'string') return null;
            const s = section as SectionData;

            return (
              <Reorder.Item key={s.id || idx} value={section} className="relative group">
                <div className="p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:border-slate-300">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
                    <span className="bg-slate-900 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Layout size={12} /> Bloque: {s.type}
                    </span>
                    <button onClick={() => setPage({...page!, sections: page!.sections.filter((_,i) => i !== idx)})} className="text-slate-200 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>

                  <SectionForm 
                    section={s} 
                    items={s.type === 'clases' ? dbItems.clases : s.type === 'noticias' ? dbItems.noticias : []}
                    instruments={dbItems.instruments}
                    onUpdateInstruments={(list) => updateInstrumentsAdmin(list).then(refreshData)}
                    onChange={(newContent, newSettings) => {
                      const newSections = [...page!.sections];
                      newSections[idx] = { ...s, content: newContent, settings: newSettings || s.settings };
                      setPage({ ...page!, sections: newSections });
                    }}
                    onUpsertItem={(item) => upsertItemAdmin(s.type as any, item).then(refreshData)}
                    onDeleteItem={(id) => deleteItemAdmin(s.type as any, id).then(refreshData)}
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
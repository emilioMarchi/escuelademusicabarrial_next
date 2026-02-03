"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageContent, SectionData } from "@/types";
import { getPageAdmin, savePageConfigAdmin, getCollectionAdmin, getInstrumentsAdmin, getTeachersAdmin } from "@/services/admin-services";
import { useDirtyState } from "@/context/DirtyStateContext";
import SectionForm from "../../components/SectionForm";
import { Save, RefreshCw, ChevronLeft, Trash2 } from "lucide-react";
import { Reorder, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function PageEditor() {
  const { slug } = useParams();
  const { isDirty, setDirty } = useDirtyState();
  const [page, setPage] = useState<PageContent | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
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

  const handleSaveSection = async () => {
    if (!page) return;
    await savePageConfigAdmin(page.slug, page);
    setDirty(false);
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <ChevronLeft size={20} className="text-slate-400" />
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Editor: {page?.slug}</h1>
        </div>
        <button onClick={handleSaveSection} disabled={isSavingAll} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl disabled:opacity-50 active:scale-95 transition-all">
          {isSavingAll ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Guardar Todo
        </button>
      </header>

      <Reorder.Group axis="y" values={page?.sections || []} onReorder={(newOrder) => { setPage({ ...page!, sections: newOrder }); setDirty(true); }} className="space-y-12">
        {page?.sections.map((section, idx) => {
          const s = section as SectionData;
          return (
            <Reorder.Item key={s.id} value={section}>
              <SectionForm 
                section={s} 
                items={s.type === 'clases' ? dbItems.clases : s.type === 'noticias' ? dbItems.noticias : []}
                onSave={handleSaveSection}
                onChange={(newContent, newSettings) => {
                  const newSections = [...page!.sections];
                  newSections[idx] = { ...s, content: newContent, settings: newSettings };
                  setPage({ ...page!, sections: newSections });
                }}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
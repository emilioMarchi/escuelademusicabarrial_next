"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPageAdmin, savePageConfigAdmin } from "@/services/admin-services";
import { PageContent, SectionData } from "@/types";
import { useDirtyState } from "@/context/DirtyStateContext";
import SectionForm from "../../components/SectionForm";
import { 
  Save, Settings2, Layout, Globe, ImageIcon, 
  Loader2, AlertCircle, CheckCircle2, Type
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PageEditor() {
  const { slug } = useParams();
  const { isDirty, setDirty } = useDirtyState();
  
  const [pageData, setPageData] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Solo controlamos el "dirty visual" para la sección de SEO/Hero
  const [hasChangesSEO, setHasChangesSEO] = useState(false);

  useEffect(() => {
    async function loadPage() {
      if (!slug) return;
      setLoading(true);
      const res = await getPageAdmin(slug as string);
      if (res.success && res.data) {
        setPageData(res.data as PageContent);
      }
      setLoading(false);
    }
    loadPage();
  }, [slug]);

  // Manejo de cambios en SEO / Cabecera
  const handleSEOChange = (field: keyof PageContent, value: string) => {
    if (!pageData) return;
    setPageData({ ...pageData, [field]: value });
    setHasChangesSEO(true); // Activa el borde naranja solo en esta sección
    setDirty(true);        // Activa el bloqueo global en el Sidebar
  };

  // Manejo de cambios en las Secciones
  const handleSectionChange = (index: number, updatedContent: any) => {
    if (!pageData) return;
    const newSections = [...pageData.sections];
    (newSections[index] as SectionData).content = updatedContent;
    setPageData({ ...pageData, sections: newSections });
    setDirty(true); // Activa el bloqueo global en el Sidebar
  };

  const handleSave = async () => {
    if (!pageData || !slug) return;
    setIsSaving(true);

    try {
      const res = await savePageConfigAdmin(slug as string, pageData);
      
      if (res.success) {
        setStatus({ type: 'success', msg: 'Cambios guardados con éxito' });
        setDirty(false); 
        setHasChangesSEO(false);
      } else {
        throw new Error();
      }
    } catch (e) {
      setStatus({ type: 'error', msg: 'Error al guardar los cambios' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400 animate-pulse tracking-widest text-xs">Sincronizando...</div>;
  if (!pageData) return <div className="p-20 text-center font-black uppercase text-slate-400">Página no encontrada</div>;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-10 pb-40">
      
      {/* HEADER: Título y Acción Global */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">
            {pageData.slug.replace(/-/g, ' ')}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Editor de contenidos dinámicos</p>
        </div>

        <button 
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all shadow-2xl active:scale-95
            ${isDirty 
              ? 'bg-slate-900 text-white shadow-slate-200 hover:bg-green-600' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {isSaving ? 'Guardando...' : 'Guardar Todo'}
        </button>
      </header>

      {/* SECCIÓN 1: SEO Y CABECERA (Con Alerta de Cambios Pendientes) */}
      <section className={`bg-white p-10 rounded-[3rem] border-2 transition-all duration-500 relative ${hasChangesSEO ? 'border-orange-400 shadow-2xl shadow-orange-50' : 'border-slate-100 shadow-sm'}`}>
        <AnimatePresence>
          {hasChangesSEO && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
              className="absolute -right-4 -top-4 z-20 flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-full shadow-xl"
            >
              <AlertCircle size={14} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest">Cambios en SEO / Header</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 border-b border-slate-50 pb-8 mb-8">
          <Settings2 size={24} className="text-slate-900" />
          <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-900">Configuración SEO y Cabecera</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Globe size={12} /> Meta Title</label>
              <input 
                type="text" 
                value={pageData.meta_title}
                onChange={(e) => handleSEOChange('meta_title', e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Meta Description</label>
              <textarea 
                value={pageData.meta_description}
                onChange={(e) => handleSEOChange('meta_description', e.target.value)}
                rows={3}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none text-sm"
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Type size={12} /> Título H1</label>
              <input 
                type="text" 
                value={pageData.header_title}
                onChange={(e) => handleSEOChange('header_title', e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Descripción H1</label>
              <textarea 
                value={pageData.header_description}
                onChange={(e) => handleSEOChange('header_description', e.target.value)}
                rows={3}
                className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: RENDERIZADO DE SECCIONES DINÁMICAS */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-4">
          <Layout size={24} className="text-slate-900" />
          <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-900">Bloques de Contenido</h3>
        </div>

        <div className="space-y-10">
          {pageData.sections.map((section, index) => (
            <SectionForm 
              key={index}
              section={section as SectionData}
              onChange={(updatedContent) => handleSectionChange(index, updatedContent)}
              onSave={handleSave}
            />
          ))}
        </div>
      </div>

      {/* NOTIFICACIONES DE ÉXITO O ERROR */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 border
              ${status.type === 'success' ? 'bg-slate-900 text-white border-green-500' : 'bg-red-600 text-white border-white'}`}
          >
            {status.type === 'success' ? <CheckCircle2 size={18} className="text-green-500" /> : <AlertCircle size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{status.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
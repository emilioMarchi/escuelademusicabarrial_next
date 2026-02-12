"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPageAdmin, savePageConfigAdmin, getAdminCollectionItems } from "@/services/admin-services";
import { PageContent, SectionData } from "@/types";
import { useDirtyState } from "@/context/DirtyStateContext";
import SectionForm from "../../components/SectionForm";
import { 
  Save, Settings2, Layout, Globe, AlertCircle, 
  Loader2, CheckCircle2, Type, Plus, GripVertical, Trash2
} from "lucide-react";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";

function DraggableSectionItem({ section, children, onDelete }: { section: SectionData, children: React.ReactNode, onDelete: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={section} id={section.id} dragListener={false} dragControls={controls} className="group relative">
      <div className="absolute -left-12 top-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div onPointerDown={(e) => controls.start(e)} className="p-2 bg-white text-slate-400 hover:text-slate-900 rounded-lg shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing touch-none">
          <GripVertical size={20} />
        </div>
        <button onClick={onDelete} className="p-2 bg-white text-red-300 hover:text-red-500 rounded-lg shadow-sm border border-slate-100 hover:bg-red-50 transition-colors">
          <Trash2 size={20} />
        </button>
      </div>
      {children}
    </Reorder.Item>
  );
}

export default function PageEditor() {
  const { slug } = useParams();
  const { isDirty, setDirty } = useDirtyState();
  
  const [pageData, setPageData] = useState<PageContent | null>(null);
  const [auxItems, setAuxItems] = useState<{ clases: any[], noticias: any[] }>({ clases: [], noticias: [] });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [hasChangesSEO, setHasChangesSEO] = useState(false);

  useEffect(() => {
    async function loadPage() {
      if (!slug) return;
      setLoading(true);
      const [resPage, resClases, resNoticias] = await Promise.all([
        getPageAdmin(slug as string),
        getAdminCollectionItems("clases"),
        getAdminCollectionItems("noticias")
      ]);

      if (resPage.success && resPage.data) {
        setPageData(resPage.data as PageContent);
      }
      
      setAuxItems({
        clases: Array.isArray(resClases) ? resClases : [],
        noticias: Array.isArray(resNoticias) ? resNoticias : []
      });
      setLoading(false);
    }
    loadPage();
  }, [slug]);

  const handleSEOChange = (field: keyof PageContent, value: string) => {
    if (!pageData) return;
    setPageData({ ...pageData, [field]: value });
    setHasChangesSEO(true);
    setDirty(true);
  };

  const handleReorder = async (newOrder: any[]) => {
    if (!pageData) return;
    const updatedPage = { ...pageData, sections: newOrder as SectionData[] };
    setPageData(updatedPage);
    
    setIsSaving(true);
    const res = await savePageConfigAdmin(slug as string, updatedPage);
    if (res.success) {
      setDirty(false);
    }
    setIsSaving(false);
  };

  const handleSectionChange = (id: string, updatedContent: any, updatedSettings?: any) => {
    if (!pageData) return;
    const newSections = pageData.sections.map((s) => {
      const section = s as SectionData;
      if (section.id === id) {
        return { ...section, content: updatedContent, settings: updatedSettings || section.settings };
      }
      return section;
    });
    setPageData({ ...pageData, sections: newSections });
    setDirty(true);
  };

  const handleAddSection = async (type: 'hero' | 'texto-bloque' | 'clases' | 'noticias' | 'contacto') => {
    if (!pageData || !slug) return;

    const newId = Math.random().toString(36).substr(2, 9);
    const newSection: SectionData = {
      id: newId,
      type,
      content: {
        title: type === 'hero' ? 'Nuevo Hero' : 'Título de Sección',
        description: '',
        slides: type === 'hero' ? [{ title: 'Slide 1', description: '', image_url: '', buttons: [] }] : [],
        layout: 'image-left',
        form_type: 'general' 
      },
      settings: { layout: 'image-left', form_type: 'general' }
    };

    const updatedPage = { ...pageData, sections: [newSection, ...pageData.sections] };
    setPageData(updatedPage);
    
    setIsSaving(true);
    try {
      const res = await savePageConfigAdmin(slug as string, updatedPage);
      if (res.success) {
        setStatus({ type: 'success', msg: 'Bloque agregado y guardado' });
        setDirty(false);
      } else { throw new Error(); }
    } catch (e) {
      setStatus({ type: 'error', msg: 'Error al agregar bloque' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!pageData || !confirm("¿Estás seguro de eliminar este bloque?")) return;
    
    const updatedSections = pageData.sections.filter(s => (s as SectionData).id !== id);
    const updatedPage = { ...pageData, sections: updatedSections };
    
    setPageData(updatedPage);
    setIsSaving(true);
    
    const res = await savePageConfigAdmin(slug as string, updatedPage);
    if (res.success) {
      setStatus({ type: 'success', msg: 'Bloque eliminado correctamente' });
      setDirty(false);
    } else {
      setStatus({ type: 'error', msg: 'Error al eliminar el bloque' });
    }
    setIsSaving(false);
    setTimeout(() => setStatus(null), 3000);
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
      } else { throw new Error(); }
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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">{pageData.slug.replace(/-/g, ' ')}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">Editor de contenidos dinámicos</p>
        </div>
        <button onClick={handleSave} disabled={!isDirty || isSaving} className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest transition-all shadow-2xl active:scale-95 ${isDirty ? 'bg-slate-900 text-white shadow-slate-200 hover:bg-green-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}>
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          {isSaving ? 'Guardando...' : 'Guardar Todo'}
        </button>
      </header>

      {/* SEO Section */}
      <section className={`bg-white p-10 rounded-[3rem] border-2 transition-all duration-500 relative ${hasChangesSEO ? 'border-orange-400 shadow-2xl shadow-orange-50 z-10' : 'border-slate-100 shadow-sm'}`}>
        <AnimatePresence>
          {hasChangesSEO && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} 
              className="absolute -right-4 -top-4 flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-full shadow-xl z-20">
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
                    <input type="text" value={pageData.meta_title} onChange={(e) => handleSEOChange('meta_title', e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all text-sm"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Meta Description</label>
                    <textarea value={pageData.meta_description} onChange={(e) => handleSEOChange('meta_description', e.target.value)} rows={3} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none text-sm"/>
                </div>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2"><Type size={12} /> Título H1</label>
                    <input type="text" value={pageData.header_title} onChange={(e) => handleSEOChange('header_title', e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all text-sm"/>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4">Descripción H1</label>
                    <textarea value={pageData.header_description} onChange={(e) => handleSEOChange('header_description', e.target.value)} rows={3} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none text-sm"/>
                </div>
            </div>
        </div>
      </section>

      {/* BARRA FLOTANTE CON BOTÓN DE GUARDADO RÁPIDO */}
      <div className="p-4 bg-slate-100 rounded-[2rem] flex flex-wrap gap-4 items-center justify-center sticky top-4 z-40 shadow-lg border-2 border-white/50 backdrop-blur-md transition-all">
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mr-4">Agregar Bloque:</span>
        {[{ type: 'hero', label: 'Hero Slider' }, { type: 'texto-bloque', label: 'Texto + Foto' }, { type: 'clases', label: 'Grilla Clases' }, { type: 'noticias', label: 'Grilla Noticias' }, { type: 'contacto', label: 'Form Contacto' }].map((btn) => (
          <button key={btn.type} onClick={() => handleAddSection(btn.type as any)} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-200 hover:bg-slate-900 hover:text-white hover:scale-105 transition-all">
            <Plus size={12} /> {btn.label}
          </button>
        ))}

        {/* BOTÓN GUARDAR DINÁMICO */}
        <AnimatePresence>
          {isDirty && (
            <motion.button
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-green-700 transition-all active:scale-95 ml-4"
            >
              {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-8 pl-12"> 
        <div className="flex items-center gap-4 px-4 -ml-12">
          <Layout size={24} className="text-slate-900" />
          <h3 className="font-black uppercase text-xs tracking-[0.2em] text-slate-900">Bloques de Contenido</h3>
        </div>

        <Reorder.Group axis="y" values={pageData.sections} onReorder={handleReorder} className="space-y-10">
            {pageData.sections.map((s, index) => {
                const section = s as SectionData;
                let itemsToPass: any[] = [];
                if (section.type === 'clases') itemsToPass = auxItems.clases;
                if (section.type === 'noticias') itemsToPass = auxItems.noticias;

                return (
                    <DraggableSectionItem key={section.id} section={section} onDelete={() => handleDeleteSection(section.id)}>
                         <SectionForm 
                            section={section}
                            items={itemsToPass} 
                            onChange={(updatedContent, updatedSettings) => handleSectionChange(section.id, updatedContent, updatedSettings)}
                            onSave={handleSave}
                          />
                    </DraggableSectionItem>
                );
            })}
        </Reorder.Group>
      </div>

      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 z-[100] border
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
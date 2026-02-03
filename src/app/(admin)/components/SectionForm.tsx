"use client";
import { useRef, useState, useEffect } from "react";
import { SectionData } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { useDirtyState } from "@/context/DirtyStateContext";
import { 
  Plus, Trash2, Image as ImageIcon, Camera, Settings2, 
  Music, Newspaper, FileText, Save, AlertCircle, Loader2, Heading
} from "lucide-react";

interface Props {
  section: SectionData;
  items?: any[];
  onChange: (updatedContent: any, updatedSettings?: any) => void;
  onSave?: () => Promise<void>; 
}

export default function SectionForm({ section, items = [], onChange, onSave }: Props) {
  const { setDirty } = useDirtyState();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { setHasChanges(false); }, [section.id]);

  const handleLocalChange = (newContent: any, newSettings?: any) => {
    setHasChanges(true);
    setDirty(true);
    onChange(newContent, newSettings || section.settings);
  };

  const handleIndividualSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    await onSave();
    setHasChanges(false);
    setDirty(false);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 relative group">
      <AnimatePresence>
        {hasChanges && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute -right-4 top-0 z-20 flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-xl">
            <AlertCircle size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cambios pendientes</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-10 bg-white rounded-[3rem] border-2 transition-all duration-500 ${hasChanges ? 'border-orange-400 shadow-2xl shadow-orange-100' : 'border-slate-100 shadow-sm'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl transition-colors ${hasChanges ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'}`}>
              <Settings2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Bloque: {section.type}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {section.id}</p>
            </div>
          </div>

          {hasChanges && (
            <button onClick={handleIndividualSave} disabled={isSaving} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar Sección
            </button>
          )}
        </div>

        {/* --- FORMULARIO --- */}
        <div className="space-y-10">
          {/* Títulos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título Principal</label>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus-within:border-slate-900 transition-all">
                <Heading size={18} className="text-slate-400" />
                <input type="text" value={section.content.title || ""} onChange={(e) => handleLocalChange({ ...section.content, title: e.target.value })} className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-900 placeholder:text-slate-300" placeholder="Título de la sección..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Subtítulo / Bajada</label>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus-within:border-slate-900 transition-all">
                <FileText size={18} className="text-slate-400" />
                <input type="text" value={section.content.subtitle || section.content.description || ""} onChange={(e) => handleLocalChange({ ...section.content, subtitle: e.target.value, description: e.target.value })} className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-900 placeholder:text-slate-300" placeholder="Descripción corta..." />
              </div>
            </div>
          </div>

          {/* EDITOR HERO */}
          {section.type === 'hero' && (
            <div className="space-y-8">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Slides del Banner</label>
              <div className="grid grid-cols-1 gap-6">
                {section.content.slides?.map((slide, sIdx) => (
                  <div key={sIdx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-40 h-40 bg-slate-200 rounded-[2rem] overflow-hidden shrink-0 relative group/img shadow-inner">
                        {slide.image_url ? <img src={slide.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="m-auto mt-14 text-slate-400" />}
                        <button className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white"><Camera size={20}/></button>
                      </div>
                      <div className="flex-1 space-y-4">
                        <input type="text" placeholder="Título Slide (ej: Inscripciones)" value={slide.title || ""} onChange={(e) => {
                          const newSlides = [...section.content.slides!];
                          newSlides[sIdx].title = e.target.value;
                          handleLocalChange({ ...section.content, slides: newSlides });
                        }} className="w-full p-4 bg-white rounded-xl text-xs font-bold text-slate-900 outline-none border border-slate-100" />
                        <textarea placeholder="Descripción Slide" value={slide.description || ""} onChange={(e) => {
                          const newSlides = [...section.content.slides!];
                          newSlides[sIdx].description = e.target.value;
                          handleLocalChange({ ...section.content, slides: newSlides });
                        }} className="w-full p-4 bg-white rounded-xl text-xs font-bold text-slate-900 outline-none border border-slate-100" />
                      </div>
                    </div>

                    {/* Botones del Slide */}
                    <div className="pt-6 border-t border-slate-200">
                      <label className="text-[9px] font-black uppercase text-slate-400 mb-4 block tracking-widest">Botones de Acción</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {slide.buttons?.map((btn, bIdx) => (
                          <div key={bIdx} className="bg-white p-4 rounded-2xl flex gap-3 items-center border border-slate-100 shadow-sm">
                            <input type="text" placeholder="Texto" value={btn.text} onChange={(e) => {
                              const newSlides = [...section.content.slides!];
                              newSlides[sIdx].buttons![bIdx].text = e.target.value;
                              handleLocalChange({ ...section.content, slides: newSlides });
                            }} className="w-24 text-[10px] font-black text-slate-900 uppercase bg-slate-50 p-2 rounded-lg" />
                            <input type="text" placeholder="Link" value={btn.link} onChange={(e) => {
                              const newSlides = [...section.content.slides!];
                              newSlides[sIdx].buttons![bIdx].link = e.target.value;
                              handleLocalChange({ ...section.content, slides: newSlides });
                            }} className="flex-1 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg font-bold" />
                            <button onClick={() => {
                              const newSlides = [...section.content.slides!];
                              newSlides[sIdx].buttons!.splice(bIdx, 1);
                              handleLocalChange({ ...section.content, slides: newSlides });
                            }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newSlides = [...section.content.slides!];
                          if(!newSlides[sIdx].buttons) newSlides[sIdx].buttons = [];
                          newSlides[sIdx].buttons!.push({ text: "Botón", link: "/", style: "solid" });
                          handleLocalChange({ ...section.content, slides: newSlides });
                        }} className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all">+ Añadir Botón</button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                    const newSlides = [...(section.content.slides || []), { image_url: "", title: "", description: "", buttons: [] }];
                    handleLocalChange({ ...section.content, slides: newSlides });
                  }} className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black text-xs uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all bg-slate-50/50">+ Nueva Diapositiva</button>
              </div>
            </div>
          )}

          {/* INDICADORES CLASES / NOTICIAS */}
          {(section.type === 'clases' || section.type === 'noticias') && (
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex justify-between items-center overflow-hidden relative shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  {section.type === 'clases' ? <Music className="text-green-400" /> : <Newspaper className="text-orange-400" />}
                  <h4 className="text-2xl font-black uppercase tracking-tighter">Contenido del Sitio</h4>
                </div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest max-w-xs">Este bloque consume la data global cargada en el Panel.</p>
              </div>
              <div className="text-right relative z-10">
                <span className="text-6xl font-black block leading-none">{items.length}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{section.type === 'clases' ? 'Clases Activas' : 'Noticias'}</span>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[80px] -mr-24 -mt-24"></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
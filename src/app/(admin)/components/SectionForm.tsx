"use client";

import { useRef, useState, useEffect } from "react";
import { SectionData } from "@/types";
import { AnimatePresence, motion } from "framer-motion"; 
import { useDirtyState } from "@/context/DirtyStateContext";
import { uploadImageToStorage } from "@/lib/StoreUtils";
import { 
  Plus, Trash2, Image as ImageIcon, Camera, 
  Music, Newspaper, FileText, AlertCircle, Loader2, 
  AlignLeft, AlignRight, Mail, UserPlus, 
  MessageSquare, Type, Hash
} from "lucide-react";

interface Props {
  section: SectionData;
  items?: any[];
  onChange: (updatedContent: any, updatedSettings?: any) => void;
  onSave?: () => void;
}

export default function SectionForm({ section, items = [], onChange, onSave }: Props) {
  const { isDirty, setDirty } = useDirtyState();
  const slideFileRef = useRef<HTMLInputElement>(null);
  const blockFileRef = useRef<HTMLInputElement>(null);
  
  // --- VARIABLES SEGURAS ---
  const content = (section.content || {}) as any;
  const settings = (section.settings || {}) as any;
  const slides = (content.slides || []) as any[];

  // --- LÓGICA SMART DIRTY ---
  const [hasChanges, setHasChanges] = useState(false);
  const originalState = useRef(JSON.stringify({
    content: section.content,
    settings: section.settings
  }));

  useEffect(() => {
    const currentState = JSON.stringify({
      content: section.content,
      settings: section.settings
    });
    const isDifferent = currentState !== originalState.current;
    
    setHasChanges(isDifferent);
    if (isDifferent && !isDirty) {
        setDirty(true);
    }
  }, [section.content, section.settings, isDirty, setDirty]);

  useEffect(() => {
    if (!isDirty) {
      originalState.current = JSON.stringify({
        content: section.content,
        settings: section.settings
      });
      setHasChanges(false);
    }
  }, [isDirty]);

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [uploading, setUploading] = useState(false);

  // --- HANDLER DE ACTUALIZACIÓN ---
  const handleUpdate = (newContent: any, newSettings?: any) => {
    onChange(newContent, newSettings || settings);
  };

  const handleImageUpload = async (file: File, isSlide = false) => {
    setUploading(true);
    try {
      const url = await uploadImageToStorage(file);
      if (url) {
        if (isSlide) {
          const ns = [...slides];
          ns[activeSlideIdx] = { ...ns[activeSlideIdx], image_url: url };
          handleUpdate({ ...content, slides: ns });
        } else {
          handleUpdate({ ...content, image_url: url });
        }
        
        if (onSave) {
          setTimeout(() => onSave(), 100);
        }
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setUploading(false); 
    }
  };

  // --- HELPERS PARA HERO ---
  const addSlide = () => {
    const newSlide = { title: "Nuevo Slide", description: "", image_url: "", buttons: [] };
    handleUpdate({ ...content, slides: [...slides, newSlide] });
    setActiveSlideIdx(slides.length);
  };

  const removeSlide = (idxToRemove: number) => {
    const filteredSlides = slides.filter((s: any, i: number) => i !== idxToRemove);
    handleUpdate({ ...content, slides: filteredSlides });
    setActiveSlideIdx(0);
  };

  const addButton = () => {
    const ns = [...slides];
    const currentSlide = { ...ns[activeSlideIdx] };
    const currentButtons = [...(currentSlide.buttons || [])];
    const newBtn = { text: "Nuevo Botón", link: "/", style: "solid" };
    
    currentSlide.buttons = [...currentButtons, newBtn];
    ns[activeSlideIdx] = currentSlide;
    
    handleUpdate({ ...content, slides: ns });
  };

  const removeButton = (btnIdxToRemove: number) => {
    const ns = [...slides];
    const currentSlide = { ...ns[activeSlideIdx] };
    const currentButtons = (currentSlide.buttons || []).filter((b: any, i: number) => i !== btnIdxToRemove);
    
    currentSlide.buttons = currentButtons;
    ns[activeSlideIdx] = currentSlide;
    
    handleUpdate({ ...content, slides: ns });
  };

  // --- VALOR SEGURO PARA FORM TYPE ---
  const currentFormType = settings.form_type || content.form_type || 'general';

  return (
    <div className={`relative transition-all duration-500 rounded-[3.5rem] border-2 bg-white overflow-hidden
      ${hasChanges ? 'border-orange-400 shadow-2xl shadow-orange-100/50 z-10' : 'border-slate-100 shadow-sm z-0'}`}>
      
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-8">
          <div className={`p-4 rounded-2xl transition-colors duration-500 ${hasChanges ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'}`}>
            {section.type === 'hero' && <ImageIcon size={24}/>}
            {section.type === 'texto-bloque' && <FileText size={24}/>}
            {section.type === 'clases' && <Music size={24}/>}
            {section.type === 'noticias' && <Newspaper size={24}/>}
            {section.type === 'contacto' && <Mail size={24}/>}
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Bloque: {section.type}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {section.id}</p>
          </div>
        </div>

        <div className="space-y-10">
          {section.type === 'hero' && (
            <div className="space-y-8">
              <div className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] space-y-4">
                 <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Type size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Textos por defecto</span>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    <input type="text" value={content.title || ""} onChange={(e) => handleUpdate({ ...content, title: e.target.value })}
                      placeholder="Título General" className="w-full p-4 bg-white border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all shadow-sm"/>
                    <textarea rows={2} value={content.description ?? content.subtitle ?? ""} onChange={(e) => handleUpdate({ ...content, description: e.target.value })}
                      placeholder="Descripción General" className="w-full p-4 bg-white border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none shadow-sm"/>
                 </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 rounded-[2rem] w-fit">
                {slides.map((s: any, idx: number) => (
                  <div key={idx} className="relative group/tab">
                    <button type="button" onClick={() => setActiveSlideIdx(idx)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                        ${activeSlideIdx === idx ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      Slide {idx + 1}
                    </button>
                    {slides.length > 1 && (
                      <button type="button" onClick={() => removeSlide(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/tab:opacity-100 transition-opacity shadow-lg">
                        <Trash2 size={10} className="rotate-45"/>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSlide} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-green-600 transition-all ml-2">
                    <Plus size={16}/>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <input type="text" value={slides[activeSlideIdx]?.title || ""}
                    onChange={(e) => {
                      const ns = [...slides];
                      ns[activeSlideIdx].title = e.target.value;
                      handleUpdate({ ...content, slides: ns });
                    }}
                    placeholder="Título del slide" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all"/>
                  <textarea rows={3} value={slides[activeSlideIdx]?.description || ""}
                    onChange={(e) => {
                      const ns = [...slides];
                      ns[activeSlideIdx].description = e.target.value;
                      handleUpdate({ ...content, slides: ns });
                    }}
                    placeholder="Descripción" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none"/>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Botones de Acción</p>
                      <button type="button" onClick={addButton} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-green-600 transition-all">
                        <Plus size={12}/> Nuevo Botón
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(slides[activeSlideIdx]?.buttons || []).map((btn: any, bIdx: number) => (
                        <div key={bIdx} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-4 relative">
                          <button type="button" onClick={() => removeButton(bIdx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          <div className="grid grid-cols-2 gap-4">
                            <input type="text" value={btn.text} placeholder="Texto" onChange={(e) => {
                                const ns = [...slides];
                                ns[activeSlideIdx].buttons[bIdx].text = e.target.value;
                                handleUpdate({...content, slides: ns});
                            }} className="w-full p-3 bg-white rounded-xl text-[11px] font-bold text-slate-900 border border-slate-100 outline-none focus:border-slate-900" />
                            <input type="text" value={btn.link} placeholder="Link" onChange={(e) => {
                                const ns = [...slides];
                                ns[activeSlideIdx].buttons[bIdx].link = e.target.value;
                                handleUpdate({...content, slides: ns});
                            }} className="w-full p-3 bg-white rounded-xl text-[11px] font-bold text-slate-900 border border-slate-100 outline-none focus:border-slate-900" />
                          </div>
                          <div className="flex gap-2">
                            {['solid', 'outline'].map(s => (
                              <button key={s} type="button" onClick={() => {
                                const ns = [...slides];
                                ns[activeSlideIdx].buttons[bIdx].style = s;
                                handleUpdate({...content, slides: ns});
                              }} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 transition-all ${btn.style === s ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'border-slate-200 text-slate-400'}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="aspect-video bg-slate-100 rounded-[3rem] overflow-hidden relative group border-2 border-slate-100 flex items-center justify-center">
                    {uploading ? <Loader2 className="animate-spin text-slate-300" size={32} /> : (
                      <>
                        <img src={slides[activeSlideIdx]?.image_url} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => slideFileRef.current?.click()} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-2 font-black uppercase text-[10px] tracking-widest">
                          <Camera size={24} /> Cambiar Fondo
                        </button>
                      </>
                    )}
                  </div>
                  <input type="file" ref={slideFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)} />
                </div>
              </div>
            </div>
          )}

          {section.type === 'texto-bloque' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <button type="button" onClick={(e) => { e.preventDefault(); handleUpdate(content, { ...settings, layout: 'image-left' }); }} 
                    className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all duration-200
                      ${settings.layout === 'image-left' || (!settings.layout && content.layout === 'image-left') ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.02]' : 'border-slate-100 text-slate-400 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                    <AlignLeft size={18}/> Foto Izquierda
                  </button>
                  <button type="button" onClick={(e) => { e.preventDefault(); handleUpdate(content, { ...settings, layout: 'image-right' }); }} 
                    className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all duration-200
                      ${settings.layout === 'image-right' || (!settings.layout && content.layout === 'image-right') ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-[1.02]' : 'border-slate-100 text-slate-400 bg-slate-50 hover:bg-white hover:border-slate-300'}`}>
                    <AlignRight size={18}/> Foto Derecha
                  </button>
                </div>

                <input type="text" value={content.title || ""} onChange={(e) => handleUpdate({ ...content, title: e.target.value })}
                  placeholder="Título del bloque" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-black text-slate-900 text-xl outline-none transition-all"/>
                <textarea rows={6} value={content.description || ""} onChange={(e) => handleUpdate({ ...content, description: e.target.value })}
                  placeholder="Cuerpo de texto" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none leading-relaxed"/>
              </div>
              <div className="space-y-4">
                <div className="aspect-square bg-slate-100 rounded-[3.5rem] overflow-hidden relative group border-2 border-slate-100 flex items-center justify-center shadow-inner">
                  {content.image_url ? (
                    <img src={content.image_url} className="w-full h-full object-cover" alt="Vista previa" />
                  ) : (<ImageIcon size={48} className="text-slate-200" />)}
                  <button type="button" onClick={() => blockFileRef.current?.click()} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-2 font-black uppercase text-[10px] tracking-widest">
                    {uploading ? <Loader2 className="animate-spin" /> : <Camera size={24} />} {uploading ? "Subiendo..." : "Cambiar Foto"}
                  </button>
                  <input type="file" ref={blockFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </div>
              </div>
            </div>
          )}

          {(section.type === 'clases' || section.type === 'noticias') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <input type="text" value={content.title || ""} onChange={(e) => handleUpdate({ ...content, title: e.target.value })}
                    placeholder="Título sección" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all"/>
                  <textarea rows={3} value={content.description || ""} onChange={(e) => handleUpdate({ ...content, description: e.target.value })}
                    placeholder="Introducción" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none"/>
               </div>
               <div className="bg-slate-900 p-12 rounded-[3.5rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                      {section.type === 'clases' ? <Music size={150}/> : <Newspaper size={150}/>}
                  </div>
                  <p className="text-6xl font-black text-white leading-none mb-3 z-10 tabular-nums tracking-tighter">{items?.length || 0}</p>
                  <p className="text-[11px] font-black uppercase text-white/30 tracking-[0.4em] z-10">
                    {section.type === 'clases' ? 'Clases publicadas' : 'Noticias activas'}
                  </p>
               </div>
            </div>
          )}

          {section.type === 'contacto' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Modalidad Formulario</label>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => handleUpdate(content, { ...settings, form_type: 'general' })} 
                          className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${currentFormType === 'general' ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-100 text-slate-400 bg-slate-50'}`}>
                            <MessageSquare size={20}/> <span className="text-[9px] font-black uppercase tracking-widest">General</span>
                        </button>
                        <button type="button" onClick={() => handleUpdate(content, { ...settings, form_type: 'clases' })} 
                          className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${currentFormType === 'clases' ? 'border-slate-900 bg-slate-900 text-white shadow-xl' : 'border-slate-100 text-slate-400 bg-slate-50'}`}>
                            <UserPlus size={20}/> <span className="text-[9px] font-black uppercase tracking-widest">Inscripción</span>
                        </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute top-4 left-4 text-slate-400"><Hash size={16}/></div>
                    <input type="text" value={content.anchor_id || ""} onChange={(e) => handleUpdate({ ...content, anchor_id: e.target.value.replace(/[^a-z0-9-_]/g, '') })} 
                      placeholder="ID para ancla (ej: inscripcion)" className="w-full p-4 pl-12 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all text-sm"/>
                    <p className="text-[9px] text-slate-400 mt-2 ml-4 uppercase font-bold tracking-widest">Usa este nombre en el botón del Hero (ej: #inscripcion)</p>
                  </div>

                  <input type="text" value={content.title || ""} onChange={(e) => handleUpdate({ ...content, title: e.target.value })}
                    placeholder="Título formulario" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all"/>
               </div>
               <textarea rows={6} value={content.description || ""} onChange={(e) => handleUpdate({ ...content, description: e.target.value })}
                 placeholder="Instrucciones..." className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-slate-900 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none"/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
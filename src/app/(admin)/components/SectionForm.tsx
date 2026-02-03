"use client";
import { useRef, useState, useEffect } from "react";
import { SectionData } from "@/types";
import { AnimatePresence, motion, Reorder } from "framer-motion"; 
import { useDirtyState } from "@/context/DirtyStateContext";
import { uploadImageToStorage } from "@/lib/StoreUtils";
import { 
  Plus, Trash2, Image as ImageIcon, Camera, Settings2, 
  Music, Newspaper, FileText, Save, AlertCircle, Loader2, 
  Heading, GripVertical, AlignLeft, AlignRight, ExternalLink
} from "lucide-react";

interface Props {
  section: SectionData;
  items?: any[];
  onChange: (updatedContent: any, updatedSettings?: any) => void;
  onSave?: () => Promise<void>; 
}

export default function SectionForm({ section, items = [], onChange, onSave }: Props) {
  const { setDirty } = useDirtyState();
  const slideFileRef = useRef<HTMLInputElement>(null);
  const blockFileRef = useRef<HTMLInputElement>(null);
  
  const [activeSlideIdx, setActiveSlideIdx] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Evita el error "Cannot read properties of undefined (reading 'id')"
  useEffect(() => { 
    if (section?.id) {
      setHasChanges(false); 
    }
  }, [section?.id]);

  if (!section) return null;

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

  const handleImageUpload = async (file: File, isSlide: boolean = false) => {
    setUploading(true);
    try {
      const url = await uploadImageToStorage(file);
      if (isSlide && activeSlideIdx !== null) {
        const ns = [...(section.content.slides || [])];
        ns[activeSlideIdx] = { ...ns[activeSlideIdx], image_url: url };
        handleLocalChange({ ...section.content, slides: ns });
      } else {
        handleLocalChange({ ...section.content, image_url: url });
      }
    } catch (e) { 
      alert("Error al subir imagen"); 
    } finally { 
      setUploading(false); 
      setActiveSlideIdx(null); 
    }
  };

  return (
    <div className="space-y-6 relative group">
      <AnimatePresence>
        {hasChanges && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }} 
            className="absolute -right-4 top-0 z-20 flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-xl"
          >
            <AlertCircle size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Cambios pendientes</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-10 bg-white rounded-[3rem] border-2 transition-all duration-500 ${hasChanges ? 'border-orange-400 shadow-2xl shadow-orange-100' : 'border-slate-100 shadow-sm'}`}>
        
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${hasChanges ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'}`}>
              <Settings2 size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-slate-900 tracking-tighter">Bloque: {section.type}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {section.id}</p>
            </div>
          </div>
          {hasChanges && (
            <button 
              onClick={handleIndividualSave} 
              disabled={isSaving} 
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar Bloque
            </button>
          )}
        </div>

        <div className="space-y-10">
          {/* HERO SECTION */}
          {section.type === 'hero' && (
            <div className="space-y-12">
              {/* Campos para Título y Descripción del Bloque Hero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-slate-50">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título de la Sección Hero</label>
                  <input 
                    type="text" 
                    value={section.content.title || ""} 
                    onChange={(e) => handleLocalChange({ ...section.content, title: e.target.value })} 
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-900 border-2 border-transparent focus:border-slate-900 outline-none transition-all" 
                    placeholder="Ej: Bienvenidos a La Escuela"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descripción General</label>
                  <textarea 
                    rows={2} 
                    value={section.content.description || ""} 
                    onChange={(e) => handleLocalChange({ ...section.content, description: e.target.value })} 
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium text-slate-700 border-2 border-transparent focus:border-slate-900 outline-none transition-all" 
                    placeholder="Breve texto introductorio..."
                  />
                </div>
              </div>

              {/* LISTADO DE SLIDES */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Diapositivas / Slides</label>
                <Reorder.Group 
                  axis="y" 
                  values={section.content.slides || []} 
                  onReorder={(ns) => handleLocalChange({...section.content, slides: ns})} 
                  className="space-y-6"
                >
                  {section.content.slides?.map((slide, sIdx) => (
                    <Reorder.Item key={slide.image_url + sIdx} value={slide}>
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 relative group/slide">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-900">
                          <GripVertical size={20} />
                        </div>
                        
                        <div className="flex gap-8 pl-6">
                          <div className="w-44 h-44 bg-slate-200 rounded-[2rem] overflow-hidden shrink-0 flex items-center justify-center relative group/img shadow-inner">
                            {slide.image_url ? (
                              <img src={slide.image_url} className="w-full h-full object-cover object-center" />
                            ) : (
                              <ImageIcon size={32} className="text-slate-400" />
                            )}
                            <button 
                              onClick={() => { setActiveSlideIdx(sIdx); slideFileRef.current?.click(); }} 
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"
                            >
                              <Camera size={24} />
                            </button>
                          </div>
                          <div className="flex-1 space-y-4">
                            <input 
                              type="text" 
                              placeholder="Título del Slide" 
                              value={slide.title || ""} 
                              onChange={(e) => { 
                                const ns = [...section.content.slides!]; 
                                ns[sIdx].title = e.target.value; 
                                handleLocalChange({...section.content, slides: ns}); 
                              }} 
                              className="w-full p-4 bg-white rounded-xl text-sm font-bold text-slate-900 border border-slate-200 outline-none" 
                            />
                            <textarea 
                              placeholder="Descripción" 
                              rows={2} 
                              value={slide.description || ""} 
                              onChange={(e) => { 
                                const ns = [...section.content.slides!]; 
                                ns[sIdx].description = e.target.value; 
                                handleLocalChange({...section.content, slides: ns}); 
                              }} 
                              className="w-full p-4 bg-white rounded-xl text-xs font-bold text-slate-900 border border-slate-200 outline-none" 
                            />
                          </div>
                        </div>

                        {/* BOTONES DEL SLIDE */}
                        <div className="pl-6 space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Botones</span>
                              <button 
                                onClick={() => { 
                                  const ns = [...section.content.slides!];
                                  if(!ns[sIdx].buttons) ns[sIdx].buttons = [];
                                  ns[sIdx].buttons.push({text: "Nuevo Botón", link: "/", style: "solid"});
                                  handleLocalChange({...section.content, slides: ns});
                                }} 
                                className="text-[9px] font-black uppercase bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition-all"
                              >
                                + Añadir
                              </button>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {slide.buttons?.map((btn, bIdx) => (
                                <div key={bIdx} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-sm">
                                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg text-slate-900">
                                     <span className="text-[9px] font-black text-slate-400 uppercase w-12 shrink-0">Texto:</span>
                                     <input 
                                       type="text" 
                                       value={btn.text} 
                                       onChange={(e) => { 
                                         const ns = [...section.content.slides!]; 
                                         ns[sIdx].buttons![bIdx].text = e.target.value; 
                                         handleLocalChange({...section.content, slides: ns}); 
                                       }} 
                                       className="w-full bg-transparent text-[10px] font-black uppercase outline-none" 
                                     />
                                  </div>
                                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg text-slate-900">
                                     <span className="text-[9px] font-black text-slate-400 uppercase w-12 shrink-0">Link:</span>
                                     <input 
                                       type="text" 
                                       value={btn.link} 
                                       onChange={(e) => { 
                                         const ns = [...section.content.slides!]; 
                                         ns[sIdx].buttons![bIdx].link = e.target.value; 
                                         handleLocalChange({...section.content, slides: ns}); 
                                       }} 
                                       className="w-full bg-transparent text-[10px] font-bold outline-none" 
                                     />
                                     <ExternalLink size={12} className="text-slate-300"/>
                                  </div>
                                  <button 
                                    onClick={() => { 
                                      const ns = [...section.content.slides!]; 
                                      ns[sIdx].buttons!.splice(bIdx, 1); 
                                      handleLocalChange({...section.content, slides: ns}); 
                                    }} 
                                    className="text-[9px] font-black text-red-400 hover:text-red-600 text-right uppercase"
                                  >
                                    Eliminar Botón
                                  </button>
                                </div>
                              ))}
                           </div>
                        </div>
                        
                        <button 
                          onClick={() => { if(confirm("¿Borrar slide completo?")) { const ns = [...section.content.slides!]; ns.splice(sIdx, 1); handleLocalChange({...section.content, slides: ns}); }}} 
                          className="absolute right-8 bottom-8 text-red-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                
                <button 
                  onClick={() => { 
                    const ns = [...(section.content.slides || []), { image_url: "", title: "Nuevo Slide", description: "", buttons: [] }]; 
                    handleLocalChange({...section.content, slides: ns}); 
                  }} 
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black text-xs uppercase tracking-widest hover:border-slate-900 transition-all bg-slate-50/30"
                >
                  + Diapositiva
                </button>
              </div>
            </div>
          )}

          {/* TEXTO BLOQUE */}
          {section.type === 'texto-bloque' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título</label>
                  <input 
                    type="text" 
                    value={section.content.title || ""} 
                    onChange={(e) => handleLocalChange({ ...section.content, title: e.target.value })} 
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-900 border-2 border-transparent focus:border-slate-900 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descripción</label>
                  <textarea 
                    rows={6} 
                    value={section.content.description || ""} 
                    onChange={(e) => handleLocalChange({ ...section.content, description: e.target.value })} 
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium text-slate-700 border-2 border-transparent focus:border-slate-900 outline-none" 
                  />
                </div>
                <div className="flex gap-4">
                   <button 
                    onClick={() => handleLocalChange(section.content, { ...section.settings, layout: 'image-left' })} 
                    className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${section.settings?.layout === 'image-left' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                   >
                    <AlignLeft size={20}/><span className="text-[9px] font-black uppercase">Imagen Izquierda</span>
                   </button>
                   <button 
                    onClick={() => handleLocalChange(section.content, { ...section.settings, layout: 'image-right' })} 
                    className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${section.settings?.layout === 'image-right' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                   >
                    <AlignRight size={20}/><span className="text-[9px] font-black uppercase">Imagen Derecha</span>
                   </button>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Imagen</label>
                <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden relative group/img shadow-inner flex items-center justify-center">
                  {section.content.image_url ? (
                    <img src={section.content.image_url} className="w-full h-full object-cover object-center" />
                  ) : (
                    <ImageIcon size={48} className="text-slate-300" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="animate-spin text-white" />
                    </div>
                  )}
                  <button 
                    onClick={() => blockFileRef.current?.click()} 
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest"
                  >
                    Subir Imagen
                  </button>
                </div>
                <input type="file" ref={blockFileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </div>
            </div>
          )}

          {/* CONTACTO */}
          {section.type === 'contacto' && (
            <div className="space-y-8">
              {/* Campos para Título y Descripción */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título de la Sección</label>
                  <input 
                    type="text" 
                    value={section.content.title || ""} 
                    onChange={(e) => handleLocalChange({ ...section.content, title: e.target.value })} 
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-900 border-2 border-transparent focus:border-slate-900 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Descripción / Bajada</label>
                  <textarea 
                    rows={2} 
                    value={section.content.description || ""} 
                    onChange={(e) => handleLocalChange({ ...section.content, description: e.target.value })} 
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-medium text-slate-700 border-2 border-transparent focus:border-slate-900 outline-none transition-all" 
                  />
                </div>
              </div>

              {/* Selector de tipo de formulario existente */}
              <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex gap-4 items-center">
                  <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-900"><FileText size={24}/></div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase">Tipo de Formulario</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Actual: {section.settings?.form_type || 'general'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['general', 'inscripcion'].map((type) => (
                    <button 
                      key={type} 
                      onClick={() => handleLocalChange(section.content, { ...section.settings, form_type: type })} 
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ (section.settings?.form_type === type || (!section.settings?.form_type && type === 'general')) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* INDICADORES DINÁMICOS */}
          {(section.type === 'clases' || section.type === 'noticias') && (
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white flex justify-between items-center relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  {section.type === 'clases' ? <Music className="text-green-400" /> : <Newspaper className="text-orange-400" />}
                  <h4 className="text-2xl font-black uppercase tracking-tighter">Bloque de {section.type}</h4>
                </div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest max-w-xs leading-relaxed">Sincronizado con el Panel Principal.</p>
              </div>
              <div className="text-right relative z-10">
                <span className="text-7xl font-black block leading-none">{items.length}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Items</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <input 
        type="file" 
        ref={slideFileRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], true)} 
      />
    </div>
  );
}
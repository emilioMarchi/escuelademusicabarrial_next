"use client";
import { useRef, useState } from "react";
import { SectionData } from "@/types";
import { AnimatePresence } from "framer-motion";
import { uploadImageToStorage } from "@/lib/StoreUtils";
import { 
  Plus, Trash2, Image as ImageIcon, AlignLeft, AlignRight, 
  Camera, Settings2, Music, User, Mail, FileText, X, Edit3, Loader2, 
  MousePointerClick, Heading
} from "lucide-react";

interface Props {
  section: SectionData;
  items?: any[];
  instruments?: string[];
  teachers?: string[];
  onUpdateInstruments?: (newList: string[]) => void;
  onUpdateTeachers?: (newList: string[]) => void;
  onChange: (updatedContent: any, updatedSettings?: any) => void;
  onUpsertItem?: (item: any) => void;
  onDeleteItem?: (id: string) => void;
}

export default function SectionForm({ 
  section, items = [], instruments = [], teachers = [],
  onUpdateInstruments, onUpdateTeachers, onChange, onUpsertItem, onDeleteItem 
}: Props) {
  const itemFileRef = useRef<HTMLInputElement>(null);
  const sectionFileRef = useRef<HTMLInputElement>(null);
  const slideFileRef = useRef<HTMLInputElement>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showInstManager, setShowInstManager] = useState(false);
  const [showTeacherManager, setShowTeacherManager] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  
  const [newInst, setNewInst] = useState("");
  const [newTeacher, setNewTeacher] = useState("");
  
  const [uploading, setUploading] = useState(false);

  if (!section || typeof section === 'string') return null;
  const { type, content = {}, settings = {} } = section;

  // --- SUBIDA IMÁGENES ---
  const handleUpload = async (file: File, callback: (url: string) => void) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToStorage(file);
      callback(url);
    } catch (error) {
      alert("Error al subir imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateContent = (field: string, value: any) => onChange({ ...content, [field]: value }, settings);
  const handleUpdateSettings = (field: string, value: any) => onChange(content, { ...settings, [field]: value });

  // --- LOGICA SLIDES ---
  const handleAddSlide = () => onChange({ ...content, slides: [...(content.slides||[]), {title: "Nuevo", description:"", image_url:"", buttons: []}] }, settings);
  
  const handleUpdateSlide = (i:number, f:string, v:any) => {
     const s = [...(content.slides||[])]; s[i] = {...s[i], [f]:v}; onChange({...content, slides:s}, settings);
  };
  
  const handleRemoveSlide = (i:number) => { if(confirm("¿Borrar slide?")) { const s=[...(content.slides||[])]; s.splice(i,1); onChange({...content, slides:s}, settings); }};

  // --- LOGICA BOTONES DENTRO DE SLIDES ---
  const handleAddButtonToSlide = (slideIndex: number) => {
    const slides = [...(content.slides || [])];
    const currentButtons = slides[slideIndex].buttons || [];
    if (currentButtons.length >= 3) return; // MAX 3
    
    // Inicializamos el botón
    slides[slideIndex].buttons = [...currentButtons, { text: "Botón", link: "#", style: "solid" }];
    onChange({ ...content, slides }, settings);
  };

  const handleUpdateButtonInSlide = (slideIndex: number, btnIndex: number, field: string, value: string) => {
    const slides = [...(content.slides || [])];
    if(slides[slideIndex].buttons && slides[slideIndex].buttons![btnIndex]) {
        // @ts-ignore - Typescript a veces se queja de la indexación profunda, pero la lógica es correcta
        slides[slideIndex].buttons![btnIndex] = { ...slides[slideIndex].buttons![btnIndex], [field]: value };
        onChange({ ...content, slides }, settings);
    }
  };

  const handleRemoveButtonFromSlide = (slideIndex: number, btnIndex: number) => {
    const slides = [...(content.slides || [])];
    if(slides[slideIndex].buttons) {
        slides[slideIndex].buttons!.splice(btnIndex, 1);
        onChange({ ...content, slides }, settings);
    }
  };
  
  // Modal Logic
  const openModal = (item: any = null) => {
    setEditingItem(item ? { ...item } : {
      name: "", title: "", 
      teacher_name: teachers[0] || "",
      instrument: instruments[0] || "", 
      schedule: "", date: new Date().toISOString().split('T')[0], 
      image_url: "", description: "", excerpt: "", content: "",
      max_capacity: 10, is_active: true, category: type 
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 text-slate-900 relative">
      {/* Overlay Carga */}
      {uploading && (
        <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
           <div className="bg-slate-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
             <Loader2 className="animate-spin" size={20}/>
             <span className="text-xs font-bold uppercase tracking-widest">Subiendo...</span>
           </div>
        </div>
      )}

      {/* Inputs Ocultos */}
      <input type="file" ref={itemFileRef} className="hidden" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0]; if(f) handleUpload(f, (url) => setEditingItem({...editingItem, image_url: url}))}} />
      <input type="file" ref={sectionFileRef} className="hidden" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0]; if(f) handleUpload(f, (url) => handleUpdateContent('image_url', url))}} />
      <input type="file" ref={slideFileRef} className="hidden" accept="image/*" onChange={(e)=>{const f=e.target.files?.[0]; if(f && activeSlideIndex!==null) handleUpload(f, (url) => handleUpdateSlide(activeSlideIndex!, 'image_url', url))}} />

      {/* =========================================================
          SECCIÓN HEADER (SOLO METADATA / TEXTO)
         ========================================================= */}
      {type === 'header' && (
         <div className="space-y-6">
             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                 <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500">
                    <Heading size={16}/>
                 </div>
                 <p className="text-[10px] text-slate-500 font-medium">
                    Estás editando la <strong>Cabecera Principal</strong> de la página. 
                    <br/>Estos textos suelen ser el Título H1 y la descripción SEO visual.
                 </p>
             </div>

            <div className="space-y-4">
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Título Principal (H1)</label>
                  <input 
                    type="text" 
                    value={content.title||""} 
                    onChange={(e)=>handleUpdateContent('title',e.target.value)} 
                    className="w-full p-4 bg-slate-50 rounded-xl font-black text-xl text-slate-900 border-none focus:ring-2 focus:ring-slate-200" 
                    placeholder="Ej: Bienvenidos a la Escuela" 
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Descripción / Copete</label>
                  <textarea 
                    value={content.description||""} 
                    onChange={(e)=>handleUpdateContent('description',e.target.value)} 
                    className="w-full p-4 bg-slate-50 rounded-xl text-sm text-slate-700 border-none focus:ring-2 focus:ring-slate-200" 
                    rows={3} 
                    placeholder="Descripción corta de la página..." 
                  />
               </div>
            </div>
         </div>
      )}

      {/* =========================================================
          SECCIÓN HERO (BANNER / SLIDER)
         ========================================================= */}
      {type === 'hero' && (
        <div className="space-y-6">
           {/* Global Hero Config */}
           <div className="space-y-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase px-2 py-1 rounded">Global</span>
                  <label className="text-[10px] font-black uppercase text-slate-400">Textos Overlay</label>
              </div>
              <input 
                type="text" value={content.title || ""} 
                onChange={(e) => handleUpdateContent('title', e.target.value)} 
                placeholder="Título Principal (H1)" 
                className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-none focus:ring-2 focus:ring-slate-200" 
              />
              <textarea 
                value={content.subtitle || ""} 
                onChange={(e) => handleUpdateContent('subtitle', e.target.value)} 
                placeholder="Subtítulo o Bajada principal..." 
                className="w-full p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border-none focus:ring-2 focus:ring-slate-200" 
                rows={2}
              />
           </div>

           {/* Slides Config */}
           <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                 <label className="text-[10px] font-black uppercase text-slate-400">Gestión de Slides</label>
                 <button onClick={handleAddSlide} className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-bold flex gap-2 hover:bg-slate-700"><Plus size={10}/> Slide</button>
               </div>
               
               <div className="flex flex-col gap-4">
                 {(content.slides || []).map((s:any, i:number) => (
                   <div key={i} className="flex flex-col gap-4 p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm relative group hover:border-slate-300 transition-all">
                     
                     {/* 1. Header del Slide (Img + Textos) */}
                     <div className="flex gap-4 items-start">
                        <div className="w-24 aspect-video bg-slate-100 rounded-lg relative overflow-hidden shrink-0 border border-slate-200">
                            {s.image_url ? <img src={s.image_url} className="w-full h-full object-cover"/> : <ImageIcon className="m-auto mt-4 text-slate-300" size={16}/>}
                            <button onClick={()=>{setActiveSlideIndex(i); slideFileRef.current?.click()}} className="absolute inset-0 bg-black/50 text-white text-[8px] font-bold uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">Cambiar</button>
                        </div>
                        <div className="flex-1 space-y-2">
                            <input type="text" value={s.title||""} onChange={(e)=>handleUpdateSlide(i,'title',e.target.value)} placeholder="Título del Slide" className="w-full p-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-900 border-none" />
                            <input type="text" value={s.description||""} onChange={(e)=>handleUpdateSlide(i,'description',e.target.value)} placeholder="Subtítulo del Slide" className="w-full p-2 bg-slate-50 rounded-lg text-xs text-slate-600 border-none" />
                        </div>
                        <button onClick={()=>handleRemoveSlide(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                     </div>

                     {/* 2. Gestor de Botones Dinámico */}
                     <div className="pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1"><MousePointerClick size={10}/> Botones ({s.buttons?.length || 0}/3)</label>
                            {(s.buttons?.length || 0) < 3 && (
                                <button onClick={() => handleAddButtonToSlide(i)} className="text-[9px] font-bold text-blue-600 hover:underline">+ Agregar Botón</button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {(s.buttons || []).map((btn:any, bIdx: number) => (
                                <div key={bIdx} className="flex gap-2 items-center">
                                    <select 
                                        value={btn.style || 'solid'} 
                                        onChange={(e) => handleUpdateButtonInSlide(i, bIdx, 'style', e.target.value)}
                                        className="p-2 bg-slate-50 rounded-lg text-[10px] font-bold uppercase w-20 border-none cursor-pointer"
                                    >
                                        <option value="solid">Sólido</option>
                                        <option value="outline">Borde</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        value={btn.text} 
                                        onChange={(e) => handleUpdateButtonInSlide(i, bIdx, 'text', e.target.value)}
                                        placeholder="Texto" 
                                        className="flex-1 p-2 bg-slate-50 rounded-lg text-xs font-medium border-none"
                                    />
                                    <input 
                                        type="text" 
                                        value={btn.link} 
                                        onChange={(e) => handleUpdateButtonInSlide(i, bIdx, 'link', e.target.value)}
                                        placeholder="Link (/clases)" 
                                        className="flex-1 p-2 bg-slate-50 rounded-lg text-xs text-blue-600 border-none"
                                    />
                                    <button onClick={() => handleRemoveButtonFromSlide(i, bIdx)} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
                                </div>
                            ))}
                            {(s.buttons?.length || 0) === 0 && (
                                <p className="text-[9px] text-slate-400 italic">Sin botones configurados.</p>
                            )}
                        </div>
                     </div>

                   </div>
                 ))}
               </div>
           </div>
        </div>
      )}

      {/* --- TEXTO BLOQUE --- */}
      {type === 'texto-bloque' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-3">
              <input type="text" value={content.title||""} onChange={(e)=>handleUpdateContent('title',e.target.value)} placeholder="Título Principal" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-none" />
              <textarea value={content.description||""} onChange={(e)=>handleUpdateContent('description',e.target.value)} placeholder="Texto completo..." className="w-full p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border-none" rows={6}/>
           </div>
           <div className="space-y-4">
              <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden group border border-slate-100">
                 {content.image_url ? <img src={content.image_url} className="w-full h-full object-cover"/> : <ImageIcon size={32} className="text-slate-200"/>}
                 <button onClick={()=>sectionFileRef.current?.click()} className="absolute bottom-4 bg-black text-white px-4 py-2 rounded-full text-[9px] font-bold flex gap-2 shadow-lg hover:scale-105 transition-all"><Camera size={12}/> Imagen</button>
              </div>
              <div className="flex justify-center gap-2">
                 <button onClick={()=>handleUpdateSettings('layout','image-left')} className={`p-2 rounded-lg text-[9px] font-bold uppercase flex gap-2 transition-all ${settings.layout!=='image-right'?'bg-slate-900 text-white shadow-lg':'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}><AlignLeft size={14}/> Izq</button>
                 <button onClick={()=>handleUpdateSettings('layout','image-right')} className={`p-2 rounded-lg text-[9px] font-bold uppercase flex gap-2 transition-all ${settings.layout==='image-right'?'bg-slate-900 text-white shadow-lg':'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}><AlignRight size={14}/> Der</button>
              </div>
           </div>
        </div>
      )}

      {/* --- CONTACTO --- */}
      {type === 'contacto' && (
         <div className="space-y-4">
            <div className="space-y-3">
               <input type="text" value={content.title||""} onChange={(e)=>handleUpdateContent('title',e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-900" placeholder="Título Sección" />
               <textarea value={content.description||""} onChange={(e)=>handleUpdateContent('description',e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-xs text-slate-700" placeholder="Descripción / Instrucciones..." rows={2}/>
            </div>
            <div className="flex gap-2">
               <button onClick={()=>handleUpdateSettings('form_type','general')} className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase flex gap-2 ${settings.form_type!=='inscripcion'?'bg-blue-600 text-white':'bg-slate-100 text-slate-400'}`}><Mail size={12}/> General</button>
               <button onClick={()=>handleUpdateSettings('form_type','inscripcion')} className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase flex gap-2 ${settings.form_type==='inscripcion'?'bg-blue-600 text-white':'bg-slate-100 text-slate-400'}`}><FileText size={12}/> Inscripción</button>
            </div>
         </div>
      )}

      {/* --- CLASES / NOTICIAS --- */}
      {(type === 'clases' || type === 'noticias') && (
        <div className="space-y-4">
           <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Título Sección</label>
              <input type="text" value={content.title||""} onChange={(e)=>handleUpdateContent('title',e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-900 border-none" />
           </div>
           <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4">
                 <h4 className="text-[10px] font-black uppercase text-green-400 px-2">Gestión {type}</h4>
                 {type === 'clases' && (
                   <>
                     <button onClick={()=>setShowInstManager(true)} className="text-[9px] font-bold text-slate-400 hover:text-white flex gap-1 items-center border-l border-slate-700 pl-3"><Music size={10}/> Instr.</button>
                     <button onClick={()=>setShowTeacherManager(true)} className="text-[9px] font-bold text-slate-400 hover:text-white flex gap-1 items-center border-l border-slate-700 pl-3"><User size={10}/> Profes</button>
                   </>
                 )}
              </div>
              <button onClick={()=>openModal()} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase flex gap-2 hover:bg-green-500"><Plus size={12}/> Nuevo</button>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((it:any) => (
                 <div key={it.id} className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col gap-2 shadow-sm hover:shadow-lg relative">
                    <div className="aspect-video bg-slate-50 rounded-xl overflow-hidden relative group">
                       {it.image_url ? <img src={it.image_url} className="w-full h-full object-cover"/> : <ImageIcon className="m-auto mt-4 text-slate-200"/>}
                       <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={()=>openModal(it)} className="p-1 bg-white rounded shadow text-slate-900"><Edit3 size={12}/></button>
                          <button onClick={()=>onDeleteItem?.(it.id)} className="p-1 bg-white rounded shadow text-red-500"><Trash2 size={12}/></button>
                       </div>
                    </div>
                    <div>
                       <h5 className="text-[10px] font-bold uppercase text-slate-900 truncate">{it.name || it.title}</h5>
                       <p className="text-[9px] text-slate-500">{type==='clases' ? `${it.instrument} · ${it.teacher_name}` : it.date?.split('T')[0]}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* --- MODALES Y GESTORES (Se mantienen igual) --- */}
       <AnimatePresence>
        {showModal && editingItem && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={()=>setShowModal(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X size={16}/></button>
                <h3 className="text-xl font-black uppercase text-slate-900 mb-6">{editingItem.id ? 'Editar' : 'Crear'} {type}</h3>
                
                <div className="space-y-4">
                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-20 aspect-video bg-slate-200 rounded-xl overflow-hidden">
                         {editingItem.image_url && <img src={editingItem.image_url} className="w-full h-full object-cover"/>}
                      </div>
                      <button onClick={()=>itemFileRef.current?.click()} className="text-[9px] font-bold uppercase bg-black text-white px-4 py-2 rounded-lg flex gap-2"><Camera size={12}/> Foto</button>
                   </div>
                   <div className="space-y-3">
                      <input type="text" placeholder="Título / Nombre" value={type==='clases'?editingItem.name:editingItem.title} onChange={(e)=>setEditingItem({...editingItem, [type==='clases'?'name':'title']:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm text-slate-900" />
                      {type === 'clases' ? (
                        <>
                           <div className="grid grid-cols-2 gap-3">
                              <select value={editingItem.instrument} onChange={(e)=>setEditingItem({...editingItem, instrument:e.target.value})} className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-900">
                                 <option value="">Instrumento...</option>
                                 {instruments.map((inst,i)=><option key={i} value={inst}>{inst}</option>)}
                              </select>
                              <select value={editingItem.teacher_name} onChange={(e)=>setEditingItem({...editingItem, teacher_name:e.target.value})} className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-900">
                                 <option value="">Profesor...</option>
                                 {teachers.map((teach,i)=><option key={i} value={teach}>{teach}</option>)}
                              </select>
                           </div>
                           <input type="text" placeholder="Horarios (ej: Lun 18hs)" value={editingItem.schedule} onChange={(e)=>setEditingItem({...editingItem, schedule:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl text-xs text-slate-900" />
                        </>
                      ) : (
                        <input type="date" value={editingItem.date?.split('T')[0]} onChange={(e)=>setEditingItem({...editingItem, date:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl text-xs text-slate-900" />
                      )}
                      <textarea rows={3} placeholder="Descripción detallada..." value={editingItem.description||""} onChange={(e)=>setEditingItem({...editingItem, description:e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl text-xs text-slate-700" />
                   </div>
                   <button onClick={()=>{onUpsertItem?.(editingItem); setShowModal(false)}} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-colors">Confirmar</button>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>

       {/* (Managers de Instrumentos y Profesores se mantienen igual) */}
       <AnimatePresence>
         {showInstManager && (
            <div className="fixed inset-0 bg-slate-950/90 z-[110] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative">
                  <button onClick={()=>setShowInstManager(false)} className="absolute top-4 right-4"><X size={16}/></button>
                  <h3 className="font-black uppercase mb-4 text-slate-900">Instrumentos</h3>
                  <div className="flex gap-2 mb-4">
                     <input value={newInst} onChange={(e)=>setNewInst(e.target.value)} placeholder="Nuevo..." className="flex-1 bg-slate-100 rounded-xl p-3 text-sm text-slate-900 font-bold"/>
                     <button onClick={()=>{if(newInst) onUpdateInstruments?.([...instruments, newInst]); setNewInst("")}} className="bg-green-600 text-white p-3 rounded-xl"><Plus size={16}/></button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                     {instruments.map((inst, i)=>(
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <span className="text-xs font-bold text-slate-700">{inst}</span>
                           <button onClick={()=>onUpdateInstruments?.(instruments.filter(x=>x!==inst))} className="text-red-400"><Trash2 size={14}/></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {showTeacherManager && (
            <div className="fixed inset-0 bg-slate-950/90 z-[110] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative">
                  <button onClick={()=>setShowTeacherManager(false)} className="absolute top-4 right-4"><X size={16}/></button>
                  <h3 className="font-black uppercase mb-4 text-slate-900">Base de Docentes</h3>
                  <div className="flex gap-2 mb-4">
                     <input value={newTeacher} onChange={(e)=>setNewTeacher(e.target.value)} placeholder="Nombre Prof..." className="flex-1 bg-slate-100 rounded-xl p-3 text-sm text-slate-900 font-bold"/>
                     <button onClick={()=>{if(newTeacher) onUpdateTeachers?.([...teachers, newTeacher]); setNewTeacher("")}} className="bg-green-600 text-white p-3 rounded-xl"><Plus size={16}/></button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                     {teachers.map((teach, i)=>(
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                           <span className="text-xs font-bold text-slate-700">{teach}</span>
                           <button onClick={()=>onUpdateTeachers?.(teachers.filter(x=>x!==teach))} className="text-red-400"><Trash2 size={14}/></button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
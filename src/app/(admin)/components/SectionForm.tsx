"use client";
import { useRef, useState } from "react";
import { SectionData } from "@/types";
import { AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Image as ImageIcon, LayoutGrid, SquarePlay, 
  X, Edit3, Camera, Settings2, Music
} from "lucide-react";

interface Props {
  section: SectionData;
  items?: any[];
  instruments?: string[];
  onUpdateInstruments?: (newList: string[]) => void;
  onChange: (updatedContent: any, updatedSettings?: any) => void;
  onUpsertItem?: (item: any) => void;
  onDeleteItem?: (id: string) => void;
}

export default function SectionForm({ 
  section, 
  items = [], 
  instruments = [], 
  onUpdateInstruments, 
  onChange, 
  onUpsertItem, 
  onDeleteItem 
}: Props) {
  const itemFileRef = useRef<HTMLInputElement>(null);
  const slideFileRef = useRef<HTMLInputElement>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showInstManager, setShowInstManager] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
  const [newInst, setNewInst] = useState("");

  if (!section || typeof section !== 'object') return null;
  
  const { type, content = {}, settings = {} } = section;

  // --- MANEJO DE SLIDES ---
  const handleAddSlide = () => {
    const currentSlides = content.slides || [];
    const newSlide = { image_url: "", image_alt: "", title: "", description: "" };
    onChange({ ...content, slides: [...currentSlides, newSlide] }, settings);
  };

  const handleUpdateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...(content.slides || [])];
    newSlides[index] = { ...newSlides[index], [field]: value };
    onChange({ ...content, slides: newSlides }, settings);
  };

  const handleRemoveSlide = (index: number) => {
    if (!confirm("¿Eliminar este slide?")) return;
    const newSlides = [...(content.slides || [])];
    newSlides.splice(index, 1);
    onChange({ ...content, slides: newSlides }, settings);
  };

  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlideIndex !== null) {
      const url = URL.createObjectURL(file);
      handleUpdateSlide(activeSlideIndex, 'image_url', url);
    }
  };

  // --- MANEJO DE ITEMS (Clases/Noticias) ---
  const openModal = (item: any = null) => {
    setEditingItem(item ? { ...item } : {
      name: "", title: "", teacher_name: "", instrument: instruments[0] || "", 
      schedule: "", date: new Date().toISOString().split('T')[0], 
      image_url: "", description: "", excerpt: "", content: "",
      max_capacity: 10, is_active: true, category: type 
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Inputs ocultos */}
      <input type="file" ref={itemFileRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) setEditingItem((prev:any) => ({ ...prev, image_url: URL.createObjectURL(file) }));
      }} />
      
      <input type="file" ref={slideFileRef} className="hidden" accept="image/*" onChange={handleSlideImageUpload} />

      {/* --- BLOQUE HERO / SLIDER --- */}
      {type === 'hero' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">Configuración del Banner (Slides)</label>
             <button onClick={handleAddSlide} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 hover:bg-slate-800"><Plus size={10}/> Agregar Slide</button>
          </div>
          
          <div className="flex flex-col gap-4">
            {(content.slides || []).map((slide: any, idx: number) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl items-start">
                <div className="w-full md:w-40 aspect-video bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 relative group">
                  {slide.image_url ? <img src={slide.image_url} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={20}/></div>}
                  <button 
                    onClick={() => { setActiveSlideIndex(idx); slideFileRef.current?.click(); }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity font-black text-[9px] uppercase"
                  >
                    <Camera size={14} className="mr-1"/> Cambiar
                  </button>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-slate-400 ml-1">Título</label>
                    <input 
                      type="text" 
                      value={slide.title || ""} 
                      onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold uppercase text-slate-400 ml-1">Descripción</label>
                    <textarea 
                      rows={2}
                      value={slide.description || ""} 
                      onChange={(e) => handleUpdateSlide(idx, 'description', e.target.value)}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600"
                    />
                  </div>
                </div>

                <button onClick={() => handleRemoveSlide(idx)} className="text-slate-300 hover:text-red-500 p-2 self-start"><Trash2 size={16}/></button>
              </div>
            ))}
            {(!content.slides || content.slides.length === 0) && (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs italic">
                No hay slides activos. Agrega uno para configurar el banner principal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TÍTULO GENERAL (Para secciones que no son Hero) --- */}
      {type !== 'hero' && (
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic">Título de Sección</label>
          <input 
            type="text" 
            value={content.title || ""} 
            onChange={(e) => onChange({ ...content, title: e.target.value }, settings)} 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 shadow-inner text-sm" 
          />
        </div>
      )}
      
      {/* --- ITEMS DINÁMICOS (Clases / Noticias) --- */}
      {(type === 'clases' || type === 'noticias') && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4">
              <h4 className="text-[10px] font-black uppercase text-green-400 tracking-widest px-2">Gestión de {type}</h4>
              {type === 'clases' && (
                <button onClick={() => setShowInstManager(true)} className="flex items-center gap-2 text-slate-400 hover:text-white text-[9px] font-black uppercase border-l border-slate-700 pl-4 transition-colors"><Settings2 size={12} /> Instrumentos</button>
              )}
            </div>
            <button onClick={() => openModal()} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-green-500 shadow-xl transition-all active:scale-95"><Plus size={14} /> Nuevo</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-slate-100 rounded-[1.5rem] p-3 flex flex-col gap-3 group shadow-sm hover:shadow-xl transition-all relative">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-50">
                  {item.image_url ? <img src={item.image_url} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-slate-100"><ImageIcon /></div>}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(item)} className="p-1.5 bg-white rounded-lg text-slate-900 hover:text-blue-600 shadow-lg"><Edit3 size={12}/></button>
                    <button onClick={() => onDeleteItem?.(item.id)} className="p-1.5 bg-white rounded-lg text-slate-900 hover:text-red-600 shadow-lg"><Trash2 size={12}/></button>
                  </div>
                </div>
                <div className="space-y-0.5 px-1">
                    <h5 className="text-[10px] font-black uppercase text-slate-900 truncate">{item.name || item.title}</h5>
                    <p className="text-[9px] font-medium text-slate-400">{type === 'clases' ? item.teacher_name : item.date?.split('T')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL EDICIÓN ITEM --- */}
      <AnimatePresence>
        {showModal && editingItem && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] max-h-[90vh] overflow-y-auto shadow-2xl p-10 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X size={20}/></button>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-slate-900">{editingItem.id ? 'Editar' : 'Agregar'} {type}</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                  <div className="relative w-48 aspect-video rounded-2xl overflow-hidden bg-slate-200 border-4 border-white shadow-xl">
                    {editingItem.image_url ? <img src={editingItem.image_url} className="object-cover w-full h-full" /> : <ImageIcon size={32} className="m-auto mt-10 text-slate-300"/>}
                  </div>
                  <button onClick={() => itemFileRef.current?.click()} className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"><Camera size={12}/> Cambiar Foto</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Título / Nombre</label>
                    <input type="text" value={type === 'clases' ? (editingItem.name || "") : (editingItem.title || "")} onChange={(e) => setEditingItem({...editingItem, [type === 'clases' ? 'name' : 'title']: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-900 shadow-inner" />
                  </div>
                  {type === 'clases' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Instrumento</label>
                        <select value={editingItem.instrument || ""} onChange={(e) => setEditingItem({...editingItem, instrument: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none text-[10px] font-black uppercase tracking-widest shadow-inner cursor-pointer">
                          <option value="">Elegir...</option>
                          {instruments.map((inst, i) => <option key={i} value={inst}>{inst}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Profesor/a</label>
                        <input type="text" value={editingItem.teacher_name || ""} onChange={(e) => setEditingItem({...editingItem, teacher_name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none text-xs shadow-inner" />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Fecha Publicación</label>
                      <input type="date" value={editingItem.date ? editingItem.date.split('T')[0] : ""} onChange={(e) => setEditingItem({...editingItem, date: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none text-xs shadow-inner" />
                    </div>
                  )}
                </div>
                <button onClick={() => { onUpsertItem?.(editingItem); setShowModal(false); }} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-green-600 transition-all active:scale-95">Guardar en Base de Datos</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL GESTOR INSTRUMENTOS --- */}
      <AnimatePresence>
        {showInstManager && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl">
              <button onClick={() => setShowInstManager(false)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X size={20}/></button>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 text-slate-900"><Music className="text-green-500" /> Base de Instrumentos</h3>
              <div className="flex gap-2 mb-8">
                <input type="text" value={newInst} onChange={(e) => setNewInst(e.target.value)} placeholder="Ej: Piano..." className="flex-1 p-4 bg-slate-100 rounded-2xl border-none font-bold text-sm shadow-inner" />
                <button onClick={() => { if(newInst) onUpdateInstruments?.([...instruments, newInst]); setNewInst(""); }} className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-green-600 transition-all shadow-lg"><Plus size={20}/></button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {instruments.map((inst, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group">
                    <span className="text-sm font-black uppercase tracking-tight text-slate-700">{inst}</span>
                    <button onClick={() => onUpdateInstruments?.(instruments.filter(i => i !== inst))} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
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
"use client";
import { useRef, useState } from "react";
import { SectionData } from "@/types";
import { Reorder, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, GripVertical, Image as ImageIcon, AlignLeft, AlignRight, 
  Upload, LayoutGrid, SquarePlay, Palette, Mail, UserPlus, X, Edit3 
} from "lucide-react";

interface Props {
  section: SectionData;
  items?: any[];
  onChange: (updatedContent: any, updatedSettings?: any) => void;
  onUpsertItem?: (item: any) => void;
  onDeleteItem?: (id: string) => void;
}

export default function SectionForm({ section, items = [], onChange, onUpsertItem, onDeleteItem }: Props) {
  const mainFileRef = useRef<HTMLInputElement>(null);
  const slideFileRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  if (typeof section === 'string') return null;
  const { type, content, settings } = section;

  const updateField = (field: string, value: any) => onChange({ ...content, [field]: value }, settings);
  const updateSettings = (field: string, value: any) => onChange(content, { ...settings, [field]: value });

  const openModal = (item: any = null) => {
    setEditingItem(item || { name: "", title: "", teacher_name: "", instrument: "", date: "", image_url: "" });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <input type="file" ref={mainFileRef} className="hidden" accept="image/*" />
      <input type="file" ref={slideFileRef} className="hidden" accept="image/*" />

      {/* CABECERA */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic">Título de la Sección</label>
          <input type="text" value={content.title || ""} onChange={(e) => updateField('title', e.target.value)} className="w-full p-3.5 bg-slate-50 rounded-xl border-none font-bold text-slate-900 focus:ring-1 focus:ring-green-500 shadow-inner text-sm" />
        </div>
        {type !== 'contacto' && (
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-4 italic">Bajada / Descripción</label>
            <textarea rows={2} value={content.description || content.subtitle || ""} onChange={(e) => updateField(type === 'hero' ? 'subtitle' : 'description', e.target.value)} className="w-full p-3.5 bg-slate-50 rounded-xl border-none font-medium text-slate-700 focus:ring-1 focus:ring-green-500 shadow-inner text-sm" />
          </div>
        )}
      </div>

      {/* GESTIÓN DE CONTENIDO DINÁMICO */}
      {(type === 'clases' || type === 'noticias') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Contenido Registrado ({items.length})</h4>
            <button onClick={() => openModal()} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase flex items-center gap-1.5 hover:bg-green-700 transition-all shadow-md"><Plus size={12} /> Agregar</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 p-2 rounded-xl flex items-center gap-3 group">
                <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image_url && <img src={item.image_url} className="object-cover w-full h-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase truncate leading-none mb-1">{item.name || item.title}</p>
                  <p className="text-[7px] text-slate-400 font-bold truncate">{type === 'clases' ? item.teacher_name : item.date?.split('T')[0]}</p>
                </div>
                <div className="flex opacity-0 group-hover:opacity-100">
                  <button onClick={() => openModal(item)} className="p-1 text-slate-400 hover:text-blue-600"><Edit3 size={12}/></button>
                  <button onClick={() => onDeleteItem?.(item.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X size={20}/></button>
              <h3 className="text-sm font-black uppercase tracking-tighter">{editingItem?.id ? 'Editar' : 'Agregar'} {type}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nombre / Título</label>
                  <input type="text" value={editingItem?.name || editingItem?.title || ""} onChange={(e) => setEditingItem({...editingItem, [type === 'clases' ? 'name' : 'title']: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-sm" />
                </div>
                {type === 'clases' ? (
                  <>
                    <input type="text" placeholder="Profesor" value={editingItem?.teacher_name || ""} onChange={(e) => setEditingItem({...editingItem, teacher_name: e.target.value})} className="p-3 bg-slate-50 rounded-xl border-none text-xs" />
                    <input type="text" placeholder="Instrumento" value={editingItem?.instrument || ""} onChange={(e) => setEditingItem({...editingItem, instrument: e.target.value})} className="p-3 bg-slate-50 rounded-xl border-none text-xs" />
                  </>
                ) : (
                  <input type="date" value={editingItem?.date ? editingItem.date.split('T')[0] : ""} onChange={(e) => setEditingItem({...editingItem, date: e.target.value})} className="col-span-2 p-3 bg-slate-50 rounded-xl border-none text-xs" />
                )}
              </div>
              <button onClick={() => { onUpsertItem?.(editingItem); setShowModal(false); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-xl">Guardar en Base de Datos</button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* LAYOUT & THEME (Solo dinámicos) */}
      {(type === 'clases' || type === 'noticias') && (
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex p-1 bg-white rounded-xl border border-slate-200 gap-1 shadow-sm">
            <button onClick={() => updateSettings('layout', 'grid')} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase flex items-center gap-2 ${(settings?.layout || 'grid') === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}><LayoutGrid size={12} /> Grid</button>
            <button onClick={() => updateSettings('layout', 'slider')} className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase flex items-center gap-2 ${settings?.layout === 'slider' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}><SquarePlay size={12} /> Slider</button>
          </div>
        </div>
      )}

      {/* CONTACTO */}
      {type === 'contacto' && (
        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex p-1 bg-white rounded-xl border border-blue-200 w-fit gap-1 shadow-sm">
          <button onClick={() => updateSettings('form_type', 'general')} className={`px-6 py-3 rounded-lg text-[8px] font-black uppercase flex items-center gap-2 ${(settings?.form_type || 'general') === 'general' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-400'}`}><Mail size={12} /> Contacto</button>
          <button onClick={() => updateSettings('form_type', 'inscripcion')} className={`px-6 py-3 rounded-lg text-[8px] font-black uppercase flex items-center gap-2 ${settings?.form_type === 'inscripcion' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-400'}`}><UserPlus size={12} /> Inscripción</button>
        </div>
      )}
    </div>
  );
}
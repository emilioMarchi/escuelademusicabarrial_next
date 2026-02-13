"use client";
import { useRef, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, X, Edit3, Camera, Loader2, AlertCircle, Clock, Users, CheckCircle2, Circle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { uploadImageToStorage } from "@/lib/StoreUtils";
import { getOptimizedImage } from "@/lib/image-utils"; // <--- NUEVA IMPORTACIÓN

interface Props {
  type: "clases" | "noticias";
  items: any[];
  teachers?: string[];
  instruments?: string[];
  onClose: () => void;
  onUpsert: (item: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export default function CollectionManager({ type, items, teachers = [], instruments = [], onClose, onUpsert, onDelete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const openModal = (item: any = null) => {
    if (item) {
      setEditingItem({ ...item });
    } else {
      if (type === "clases") {
        setEditingItem({
          name: "",
          teacher_name: teachers[0] || "",
          instrument: instruments[0] || "",
          schedule: "",
          description: "",
          image_url: "",
          image_alt: "",
          max_capacity: 10,
          is_active: true,
          category: "clases"
        });
      } else {
        setEditingItem({
          title: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
          image_url: "",
          image_alt: "",
          is_active: true,
          category: "noticias"
        });
      }
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImageToStorage(file);
      setEditingItem({ ...editingItem, image_url: url });
    } catch (e) { alert("Error al subir imagen"); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    let cleanItem = { ...editingItem };

    if (type === "noticias") {
      delete (cleanItem as any).instrument;
      delete (cleanItem as any).teacher_name;
      delete (cleanItem as any).schedule;
      delete (cleanItem as any).max_capacity;
      delete (cleanItem as any).name;
    } else {
      delete (cleanItem as any).title;
      delete (cleanItem as any).date;
    }

    await onUpsert(cleanItem);
    setEditingItem(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-50 w-full max-w-6xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-8 bg-white border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">Gestionar {type}</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Base de datos centralizada</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => openModal()} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex gap-2 items-center hover:bg-green-700 transition-all shadow-lg shadow-green-900/20">
              <Plus size={16}/> Nuevo {type === 'clases' ? 'Taller' : 'Post'}
            </button>
            <button onClick={onClose} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Listado */}
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((it) => {
            const isOrphan = type === 'clases' && !teachers.includes(it.teacher_name);
            return (
              <div key={it.id} className={`bg-white p-5 rounded-[2.5rem] border shadow-sm group relative flex flex-col transition-opacity ${!it.is_active ? 'opacity-60 border-slate-200' : 'border-slate-200'}`}>
                <div className="aspect-square bg-slate-100 rounded-[2rem] overflow-hidden relative mb-5">
                  {it.image_url ? (
                    <img src={it.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 shadow-inner"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40} /></div>
                  )}
                  
                  {/* Badge de Inactivo */}
                  {!it.is_active && (
                    <div className="absolute top-4 right-4 bg-slate-900/80 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full backdrop-blur-md">Pausado</div>
                  )}

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button onClick={() => openModal(it)} className="p-4 bg-white text-slate-900 rounded-2xl hover:scale-110 transition-all shadow-xl"><Edit3 size={20}/></button>
                    <button onClick={() => confirm("¿Eliminar permanentemente?") && onDelete(it.id)} className="p-4 bg-white text-red-500 rounded-2xl hover:scale-110 transition-all shadow-xl"><Trash2 size={20}/></button>
                  </div>
                </div>
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-tight mb-1 truncate">{it.name || it.title}</h4>
                <div className="mt-auto">
                   <p className={`text-[9px] font-bold uppercase flex items-center gap-1 ${isOrphan ? 'text-red-500' : 'text-slate-400'}`}>
                    {isOrphan && <AlertCircle size={10} />}
                    {type === 'clases' ? `${it.instrument} • ${it.teacher_name}` : it.date?.split('T')[0]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Modal de Edición */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-10 relative shadow-2xl scrollbar-hide">
              <button onClick={() => setEditingItem(null)} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full text-slate-500"><X size={18}/></button>
              
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tighter">
                  {editingItem.id ? 'Editar' : 'Crear'} {type}
                </h3>
                
                {/* Switch de Activo/Inactivo */}
                <button 
                  onClick={() => setEditingItem({...editingItem, is_active: !editingItem.is_active})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${editingItem.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {editingItem.is_active ? <CheckCircle2 size={14}/> : <Circle size={14}/>}
                  <span className="text-[9px] font-black uppercase tracking-widest">{editingItem.is_active ? 'Activo' : 'Pausado'}</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Imagen */}
                <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="w-28 h-28 bg-slate-200 rounded-2xl overflow-hidden shrink-0 relative shadow-inner">
                    {editingItem.image_url && <img src={editingItem.image_url} className="w-full h-full object-cover"/>}
                    {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                  </div>
                  <div>
                    <button onClick={() => fileRef.current?.click()} className="text-[10px] font-black uppercase bg-slate-900 text-white px-6 py-3 rounded-xl flex gap-2 items-center tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                      <Camera size={14}/> {editingItem.image_url ? 'Cambiar Foto' : 'Subir Foto'}
                    </button>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-3 tracking-wider">JPG o PNG. Máx 2MB.</p>
                  </div>
                  <input 
  type="file" 
  ref={fileRef} 
  className="hidden" 
  accept="image/*" 
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        // Optimizamos antes de llamar a la utilidad de subida
        const optimizedFile = await getOptimizedImage(file); // <--- OPTIMIZACIÓN
        const url = await uploadImageToStorage(optimizedFile);
        if (url) {
          setEditingItem({ ...editingItem, image_url: url });
        }
      } catch (err) {
        console.error("Error al optimizar/subir:", err);
      } finally {
        setUploading(false);
      }
    }
  }} 
/>
                  </div>

                {/* Título/Nombre */}
                <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Título</label>
                   <input type="text" value={type === 'clases' ? editingItem.name : editingItem.title} onChange={(e) => setEditingItem({ ...editingItem, [type === 'clases' ? 'name' : 'title']: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" />
                </div>
                
                {type === 'clases' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Instrumento</label>
                         <select 
                          value={editingItem.instrument} 
                          onChange={(e) => setEditingItem({ ...editingItem, instrument: e.target.value })} 
                          className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-900 border-none ring-2 ring-slate-100"
                         >
                           {!instruments.includes(editingItem.instrument) && editingItem.instrument && (
                             <option value={editingItem.instrument}>{editingItem.instrument} (Inactivo)</option>
                           )}
                           {instruments.map(i => <option key={i} value={i}>{i}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Docente</label>
                         <select 
                          value={editingItem.teacher_name} 
                          onChange={(e) => setEditingItem({ ...editingItem, teacher_name: e.target.value })} 
                          className={`w-full p-4 rounded-2xl text-xs font-bold border-none ring-2 ${!teachers.includes(editingItem.teacher_name) ? 'bg-red-50 text-red-600 ring-red-100' : 'bg-slate-50 text-slate-900 ring-slate-100'}`}
                         >
                           {editingItem.teacher_name && !teachers.includes(editingItem.teacher_name) && (
                             <option value={editingItem.teacher_name}>{editingItem.teacher_name} (No staff)</option>
                           )}
                           {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                         </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block flex gap-1 items-center"><Clock size={10}/> Horario</label>
                         <input 
                           type="text" 
                           placeholder="Ej: Lun y Mie 18hs"
                           value={editingItem.schedule || ""} 
                           onChange={(e) => setEditingItem({ ...editingItem, schedule: e.target.value })} 
                           className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" 
                         />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block flex gap-1 items-center"><Users size={10}/> Capacidad Máx.</label>
                         <input 
                           type="number" 
                           value={editingItem.max_capacity || 0} 
                           onChange={(e) => setEditingItem({ ...editingItem, max_capacity: parseInt(e.target.value) })} 
                           className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" 
                         />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Fecha de Publicación</label>
                    <input type="date" value={editingItem.date?.split('T')[0]} onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-900 border-none ring-2 ring-slate-100" />
                  </div>
                )}

                <div>
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Descripción</label>
                   <textarea rows={4} value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-700 border-none ring-2 ring-slate-100" />
                </div>

                <button onClick={handleSave} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-green-900/20 hover:bg-green-700 transition-all transform active:scale-95">
                  Confirmar y Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
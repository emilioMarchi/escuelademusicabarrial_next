"use client";
import { useRef, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, X, Edit3, Camera, Loader2, AlertCircle, Clock, Users, CheckCircle2, Circle, User as UserIcon, Search, ChevronRight, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { uploadImageToStorage } from "@/lib/StoreUtils";
import { getOptimizedImage } from "@/lib/image-utils";

interface Props {
  type: "clases" | "noticias" | "grupos" | "alumnos";
  items: any[];
  teachers?: string[];
  instruments?: string[];
  classList?: any[]; 
  studentList?: any[];
  groupList?: any[]; 
  onClose: () => void;
  onUpsert: (item: any, collectionOverride?: string) => Promise<any>;
  onDelete: (id: string, collectionOverride?: string) => Promise<any>;
}

export default function CollectionManager({ type, items, teachers = [], instruments = [], classList = [], studentList = [], groupList = [], onClose, onUpsert, onDelete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearch] = useState("");

  const openModal = (item: any = null) => {
    if (item) {
      // LIMPIEZA PREVENTIVA AL ABRIR: Filtramos referencias a objetos eliminados
      const cleanedItem = { ...item };
      if (type === 'clases' && item.groupIds) {
        cleanedItem.groupIds = item.groupIds.filter((gid: string) => groupList?.some(g => g.id === gid));
      }
      if (type === 'alumnos' && item.groups) {
        cleanedItem.groups = item.groups.filter((g: any) => groupList?.some(gl => gl.id === g.id));
      }
      setEditingItem(cleanedItem);
    } else {
      if (type === "clases") {
        setEditingItem({ name: "", description: "", image_url: "", image_alt: "", is_active: true, category: "clases" });
      } else if (type === "grupos") {
        setEditingItem({ name: "", class_id: classList[0]?.id || "", teacher_names: [], instruments: [], schedule: "", max_capacity: 10, students: [], is_active: true, category: "grupos" });
      } else if (type === "alumnos") {
        setEditingItem({ name: "", age: "", is_active: true, category: "alumnos" });
      } else {
        setEditingItem({ title: "", description: "", date: new Date().toISOString().split('T')[0], image_url: "", image_alt: "", is_active: true, category: "noticias" });
      }
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const optimizedFile = await getOptimizedImage(file);
      const url = await uploadImageToStorage(optimizedFile);
      setEditingItem({ ...editingItem, image_url: url });
    } catch (e) { alert("Error al subir imagen"); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    let cleanItem = { ...editingItem };
    if (type === "noticias") delete (cleanItem as any).name;
    else if (type === "clases" || type === "alumnos") {
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
            <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">Gestionar {type === 'clases' ? 'Clases' : type === 'alumnos' ? 'Alumnos/as' : type === 'grupos' ? 'Grupos' : type}</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Base de datos centralizada</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => openModal()} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex gap-2 items-center hover:bg-green-700 transition-all shadow-lg shadow-green-900/20">
              <Plus size={16}/> Nuevo {type === 'clases' ? 'Clase' : type === 'grupos' ? 'Grupo' : type === 'alumnos' ? 'Alumno/a' : 'Post'}
            </button>
            <button onClick={onClose} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Listado */}
        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((it) => {
            const associatedGroups = type === 'clases' ? groupList?.filter(g => g.class_id === it.id) : 
                                   type === 'alumnos' ? groupList?.filter(g => g.students?.includes(it.id)) : [];
            
            const totalStudentsInClass = type === 'clases' ? associatedGroups?.reduce((acc, g) => acc + (g.students?.length || 0), 0) : 0;
            const instrumentsDisplay = associatedGroups?.flatMap(g => g.instruments || []).filter((v, i, a) => a.indexOf(v) === i).join(' • ');

            return (
              <div key={it.id} className={`bg-white p-5 rounded-[2.5rem] border shadow-sm group relative flex flex-col transition-opacity ${!it.is_active ? 'opacity-60 border-slate-200' : 'border-slate-200'}`}>
                {type === 'clases' || type === 'noticias' ? (
                  <div className="aspect-square bg-slate-100 rounded-[2rem] overflow-hidden relative mb-5">
                    {it.image_url ? (
                      <img src={it.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 shadow-inner"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40} /></div>
                    )}
                    {!it.is_active && <div className="absolute top-4 right-4 bg-slate-900/80 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full backdrop-blur-md">Pausada</div>}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                      <button onClick={() => openModal(it)} className="p-4 bg-white text-slate-900 rounded-2xl hover:scale-110 transition-all shadow-xl"><Edit3 size={20}/></button>
                      <button onClick={() => confirm("¿Eliminar permanentemente?") && onDelete(it.id, type)} className="p-4 bg-white text-red-500 rounded-2xl hover:scale-110 transition-all shadow-xl"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ) : type === 'grupos' ? (
                  <div className="aspect-square bg-orange-50 rounded-[2rem] p-6 flex flex-col justify-center items-center relative mb-5 border border-orange-100">
                    <Users size={48} className="text-orange-200 mb-4" />
                    <p className="text-[8px] font-black uppercase text-orange-400 mb-1">Alumnos/as</p>
                    <p className="text-3xl font-black text-orange-900">{it.students?.length || 0}</p>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm rounded-[2rem]">
                      <button onClick={() => openModal(it)} className="p-4 bg-white text-slate-900 rounded-2xl hover:scale-110 transition-all shadow-xl"><Edit3 size={20}/></button>
                      <button onClick={() => confirm("¿Eliminar permanentemente?") && onDelete(it.id, type)} className="p-4 bg-white text-red-500 rounded-2xl hover:scale-110 transition-all shadow-xl"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-blue-50 rounded-[2rem] p-6 flex flex-col justify-center items-center relative mb-5 border border-blue-100">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-md mb-4 border-4 border-blue-100">
                      <UserIcon size={32} />
                    </div>
                    <p className="text-[8px] font-black uppercase text-blue-400 mb-1">{instrumentsDisplay || 'Sin grupo'}</p>
                    <p className="text-sm font-black text-blue-900 uppercase text-center leading-tight">{it.name}</p>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm rounded-[2rem]">
                      <button onClick={() => openModal(it)} className="p-4 bg-white text-slate-900 rounded-2xl hover:scale-110 transition-all shadow-xl"><Edit3 size={20}/></button>
                      <button onClick={() => confirm("¿Eliminar permanentemente?") && onDelete(it.id, type)} className="p-4 bg-white text-red-500 rounded-2xl hover:scale-110 transition-all shadow-xl"><Trash2 size={20}/></button>
                    </div>
                  </div>
                )}
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-tight mb-1 truncate">{it.name || it.title}</h4>
                <div className="mt-auto">
                   <div className={`text-[9px] font-bold uppercase flex items-center gap-1 text-slate-400`}>
                    {type === 'clases' ? (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-900 font-black">{totalStudentsInClass}</span>
                        <span>Alumnos/as</span>
                        <span className="mx-1 opacity-30">•</span>
                        <span>{associatedGroups?.length || 0} Comisiones</span>
                      </div>
                    ) : 
                     type === 'grupos' ? `${it.instruments?.join(' • ') || 'Sin Instr.'} • ${it.teacher_names?.join(', ')}` : 
                     type === 'alumnos' ? `${it.age ? `${it.age} años` : 'Edad no cargada'}` : it.date?.split('T')[0]}
                  </div>
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
                  {editingItem.id ? 'Editar' : 'Crear'} {type === 'grupos' ? 'Grupo' : type === 'alumnos' ? 'Alumno/a' : 'Clase'}
                </h3>
                <button onClick={() => setEditingItem({...editingItem, is_active: !editingItem.is_active})} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${editingItem.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {editingItem.is_active ? <CheckCircle2 size={14}/> : <Circle size={14}/>}
                  <span className="text-[9px] font-black uppercase tracking-widest">{editingItem.is_active ? 'Activa' : 'Pausada'}</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {(type === 'clases' || type === 'noticias') && (
                  <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-28 h-28 bg-slate-200 rounded-2xl overflow-hidden shrink-0 relative shadow-inner">
                      {editingItem.image_url && <img src={editingItem.image_url} className="w-full h-full object-cover"/>}
                      {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                    </div>
                    <div>
                      <button onClick={() => fileRef.current?.click()} className="text-[10px] font-black uppercase bg-slate-900 text-white px-6 py-3 rounded-xl flex gap-2 items-center tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                        <Camera size={14}/> {editingItem.image_url ? 'Cambiar Foto' : 'Subir Foto'}
                      </button>
                    </div>
                    <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={type === 'noticias' ? 'col-span-2' : ''}>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Nombre completo</label>
                    <input type="text" value={type === 'noticias' ? editingItem.title : editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, [type === 'noticias' ? 'title' : 'name']: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" />
                  </div>
                  {type === 'alumnos' && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Edad</label>
                      <input type="number" value={editingItem.age || ""} onChange={(e) => setEditingItem({ ...editingItem, age: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" />
                    </div>
                  )}
                </div>

                {type === 'alumnos' && (
                  <div className="bg-slate-50 p-6 rounded-[2rem] ring-2 ring-slate-100 space-y-6">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block mb-4">Comisiones Inscriptas</label>
                    <div className="space-y-3">
                      {groupList?.filter(g => g.students?.includes(editingItem.id)).length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                          <AlertCircle size={20} className="mx-auto text-slate-200 mb-2"/>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sin comisiones activas</p>
                        </div>
                      ) : (
                        groupList?.filter(g => g.students?.includes(editingItem.id)).map((g: any) => (
                          <div key={g.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0"><BookOpen size={18}/></div>
                            <div className="flex flex-col flex-1">
                              <div className="flex justify-between items-start">
                                <span className="text-[11px] font-black text-slate-900 uppercase">{g.name}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">{g.students?.length || 0} Alumnos/as</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] font-bold text-slate-400 uppercase">{g.instruments?.join(', ')}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"/>
                                <span className="text-[8px] font-black text-orange-500 uppercase">{g.schedule}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {type === 'grupos' && (
                  <>
                    <div className="bg-slate-50 p-6 rounded-[2rem] ring-2 ring-slate-100 space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Instrumentos / Disciplinas</label>
                      <div className="flex flex-wrap gap-2">
                        {(editingItem.instruments || []).map((ins: string) => (
                          <span key={ins} className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-900 border border-slate-200 flex items-center gap-2">
                            {ins}
                            <button onClick={() => setEditingItem({...editingItem, instruments: editingItem.instruments.filter((i: string) => i !== ins)})} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                          </span>
                        ))}
                      </div>
                      <select onChange={(e) => {
                        const val = e.target.value;
                        if (val && !editingItem.instruments?.includes(val)) {
                          setEditingItem({...editingItem, instruments: [...(editingItem.instruments || []), val]});
                        }
                      }} className="w-full p-3 bg-white rounded-xl text-[10px] font-bold text-slate-500 border-none ring-1 ring-slate-200" value="">
                        <option value="">Añadir instrumento...</option>
                        {instruments.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] ring-2 ring-slate-100 space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Equipo Docente</label>
                      <div className="flex flex-wrap gap-2">
                        {(editingItem.teacher_names || []).map((t: string) => (
                          <span key={t} className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-900 border border-slate-200 flex items-center gap-2">
                            {t}
                            <button onClick={() => setEditingItem({...editingItem, teacher_names: editingItem.teacher_names.filter((name: string) => name !== t)})} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                          </span>
                        ))}
                      </div>
                      <select onChange={(e) => {
                        const val = e.target.value;
                        if (val && !editingItem.teacher_names?.includes(val)) {
                          setEditingItem({...editingItem, teacher_names: [...(editingItem.teacher_names || []), val]});
                        }
                      }} className="w-full p-3 bg-white rounded-xl text-[10px] font-bold text-slate-500 border-none ring-1 ring-slate-200" value="">
                        <option value="">Añadir docente...</option>
                        {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Clase vinculada</label>
                        <select value={editingItem.class_id} onChange={(e) => setEditingItem({ ...editingItem, class_id: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-900 border-none ring-2 ring-slate-100">
                          {classList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block flex gap-1 items-center"><Users size={10}/> Capacidad Máx</label>
                        <input type="number" value={editingItem.max_capacity || ""} onChange={(e) => setEditingItem({ ...editingItem, max_capacity: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" />
                      </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] ring-2 ring-slate-100">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block flex gap-1 items-center"><Clock size={10}/> Día y Horario</label>
                      <input type="text" placeholder="Ej: Lunes 18:00 a 20:00" value={editingItem.schedule || ""} onChange={(e) => setEditingItem({ ...editingItem, schedule: e.target.value })} className="w-full p-4 bg-white rounded-2xl font-bold text-slate-900 border-none ring-1 ring-slate-200 focus:ring-green-500 transition-all outline-none" />
                    </div>
                  </>
                )}

                {type === 'clases' && (
                  <div className="bg-slate-50 p-6 rounded-[3rem] border-2 border-slate-100 space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 block">Comisiones Asociadas</label>
                      <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        <Users size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-900 uppercase">Total: {groupList?.filter(g => g.class_id === editingItem.id).reduce((acc, g) => acc + (g.students?.length || 0), 0)} Alumnos/as</span>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                      {groupList?.filter(g => g.class_id === editingItem.id).length === 0 ? (
                        <p className="text-[9px] font-bold text-slate-300 uppercase text-center py-4 italic">No hay grupos vinculados a esta clase aún</p>
                      ) : (
                        groupList?.filter(g => g.class_id === editingItem.id).map((g: any) => (
                          <div key={g.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-slate-900 uppercase">{g.name}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">{g.students?.length || 0} Alumnos/as</span>
                              </div>
                              <span className="text-[8px] font-bold text-slate-400 uppercase">{g.instruments?.join(' • ')} • {g.teacher_names?.join(', ')}</span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl text-green-500"><CheckCircle2 size={16}/></div>
                          </div>
                        ))
                      )}
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase text-center px-4 italic leading-relaxed">Nota: Para vincular una comisión, edita el Grupo y selecciona esta Clase.</p>
                  </div>
                )}

                {type === 'grupos' && (
                  <div className="bg-slate-50 p-6 rounded-[3rem] border-2 border-slate-100 space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Integrantes del Grupo</label>
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                      {(editingItem.students || []).map((studentId: string) => {
                        const s = studentList.find(sl => sl.id === studentId);
                        if (!s) return null;
                        return (
                          <div key={studentId} className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between ${!s.is_active ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!s.is_active ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-500'}`}><UserIcon size={14}/></div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{s.name}</span>
                                  {!s.is_active && <span className="bg-red-50 text-red-500 text-[7px] font-black uppercase px-1.5 py-0.5 rounded border border-red-100">Inactivo</span>}
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Alumno/a</span>
                              </div>
                            </div>
                            <button onClick={() => setEditingItem({ ...editingItem, students: editingItem.students.filter((id: string) => id !== studentId) })} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-inner space-y-4">
                      <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                        <input type="text" placeholder="Buscar alumno..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none ring-1 ring-slate-100 focus:ring-green-500" onChange={(e) => setSearch(e.target.value)} value={searchTerm}/>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-2 scrollbar-hide">
                        {studentList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !editingItem.students.includes(s.id)).map(s => (
                          <button key={s.id} onClick={() => { setEditingItem({ ...editingItem, students: [...editingItem.students, s.id] }); setSearch(""); }} className="w-full text-left p-3 hover:bg-green-50 rounded-xl flex items-center justify-between group/add transition-colors">
                            <span className="text-[10px] font-bold text-slate-600 uppercase">{s.name}</span>
                            <Plus size={14} className="text-slate-300 group-hover/add:text-green-500"/>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(type !== 'grupos' && type !== 'alumnos') && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Descripción / Resumen</label>
                    <textarea rows={3} value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-700 border-none ring-2 ring-slate-100" />
                  </div>
                )}
                <button onClick={handleSave} className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-green-900/20 hover:bg-green-700 transition-all transform active:scale-95">Confirmar y Guardar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
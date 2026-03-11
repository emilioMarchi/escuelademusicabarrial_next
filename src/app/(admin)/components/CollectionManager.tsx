"use client";
import { useRef, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, X, Edit3, Camera, Loader2, AlertCircle, Clock, Users, CheckCircle2, Circle, User as UserIcon, Search, ChevronRight, BookOpen, Music as MusicIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { uploadImageToStorage } from "@/lib/StoreUtils";
import { getOptimizedImage } from "@/lib/image-utils";

interface Props {
  type: "clases" | "noticias" | "grupos" | "alumnos" | "docentes";
  items: any[];
  teachers?: string[]; // Para ListManager (viejo)
  teacherList?: any[]; // Nueva prop con objetos completos
  instruments?: string[];
  classList?: any[]; 
  studentList?: any[];
  groupList?: any[]; 
  onClose: () => void;
  onUpsert: (item: any, collectionOverride?: string) => Promise<any>;
  onDelete: (id: string, collectionOverride?: string) => Promise<any>;
}

export default function CollectionManager({ type, items, teachers = [], teacherList = [], instruments = [], classList = [], studentList = [], groupList = [], onClose, onUpsert, onDelete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearch] = useState("");
  const [listSearch, setListSearch] = useState(""); // Filtro para la lista principal

  const openModal = (item: any = null) => {
    if (item) {
      const cleanedItem = { ...item };
      // Limpiar campos SSOT al abrir para evitar confusión, aunque se limpian al guardar
      if (type === 'alumnos' || type === 'docentes') {
        delete cleanedItem.groups;
      }
      setEditingItem(cleanedItem);
    } else {
      if (type === "clases") {
        setEditingItem({ name: "", description: "", image_url: "", image_alt: "", is_active: true, category: "clases" });
      } else if (type === "grupos") {
        setEditingItem({ name: "", class_id: classList[0]?.id || "", teacher_names: [], teachers: [], instruments: [], schedule: "", max_capacity: 10, students: [], is_active: true, category: "grupos" });
      } else if (type === "alumnos") {
        setEditingItem({ name: "", age: "", is_active: true, category: "alumnos" });
      } else if (type === "docentes") {
        setEditingItem({ name: "", email: "", phone: "", instruments: [], age: "", experience: "", is_active: true, category: "docentes" });
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
    else if (type === "clases" || type === "alumnos" || type === "docentes") {
      delete (cleanItem as any).title;
      delete (cleanItem as any).date;
    }

    if (type === "grupos") {
      // Sincronizar nombres de docentes para vistas rápidas y búsqueda (SSOT: la ID es la verdad)
      cleanItem.teacher_names = (cleanItem.teachers || []).map((tid: string) => 
        teacherList.find(t => t.id === tid)?.name || 'Docente'
      );
    }

    await onUpsert(cleanItem);
    setEditingItem(null);
  };

  return (
    <div className="fixed inset-0 bg-emerald-900/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#f4fcf7] w-full max-w-7xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border border-white">
        
        {/* Header */}
        <div className="p-8 bg-white border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">
              Gestionar {type === 'clases' ? 'Clases' : type === 'alumnos' ? 'Alumnos/as' : type === 'grupos' ? 'Grupos / Comisiones' : type === 'docentes' ? 'Docentes' : 'Novedades'}
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Base de datos centralizada</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => openModal()} className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex gap-2 items-center hover:bg-green-700 transition-all shadow-lg shadow-green-900/20">
              <Plus size={16}/> Nuevo {type === 'clases' ? 'Clase' : type === 'grupos' ? 'Grupo' : type === 'alumnos' ? 'Alumno/a' : type === 'docentes' ? 'Docente' : 'Post'}
            </button>
            <button onClick={onClose} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-all">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Listado modo Tabla para TODO */}
        <div className="flex-1 overflow-y-auto p-10">
          {(type === 'alumnos' || type === 'grupos' || type === 'clases' || type === 'docentes') && (
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder={
                    type === 'alumnos' ? "Buscar alumno por nombre..." : 
                    type === 'docentes' ? "Buscar docente por nombre o especialidad..." :
                    type === 'grupos' ? "Buscar por nombre, instrumento o docente..." :
                    "Buscar por nombre de clase, grupo o docente..."
                  } 
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-white rounded-2xl text-sm font-bold text-slate-900 outline-none border border-slate-200 focus:ring-4 transition-all shadow-sm ${
                    type === 'alumnos' ? 'focus:border-blue-500 focus:ring-blue-50' : 
                    type === 'docentes' ? 'focus:border-emerald-500 focus:ring-emerald-50' :
                    type === 'grupos' ? 'focus:border-orange-500 focus:ring-orange-50' :
                    'focus:border-green-500 focus:ring-green-50'
                  }`}
                />
              </div>
              <div className={`
                ${type === 'alumnos' ? 'bg-blue-50 border-blue-100 text-blue-900' : 
                  type === 'docentes' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
                  type === 'grupos' ? 'bg-orange-50 border-orange-100 text-orange-900' : 
                  'bg-green-50 border-green-100 text-green-900'} 
                px-6 py-3 rounded-2xl border flex items-center gap-3`}
              >
                {type === 'alumnos' ? <Users size={20} className="text-blue-500" /> : 
                 type === 'docentes' ? <UserIcon size={20} className="text-emerald-500" /> :
                 type === 'grupos' ? <BookOpen size={20} className="text-orange-500" /> :
                 <MusicIcon size={20} className="text-green-500" />}
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase ${
                    type === 'alumnos' ? 'text-blue-400' : 
                    type === 'docentes' ? 'text-emerald-400' :
                    type === 'grupos' ? 'text-orange-400' : 
                    'text-green-400'} leading-none`}
                  >
                    Total {type === 'alumnos' ? 'Alumnos/as' : type === 'docentes' ? 'Docentes' : type === 'grupos' ? 'Comisiones' : 'Clases'}
                  </span>
                  <span className="text-lg font-black leading-none">{items.length}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {type === 'alumnos' ? 'Alumno/a' : type === 'docentes' ? 'Docente' : type === 'clases' ? 'Clase' : type === 'grupos' ? 'Comisión' : 'Noticia'}
                  </th>
                  {(type === 'alumnos' || type === 'docentes') && <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Edad</th>}
                  {type === 'docentes' && <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Especialidad</th>}
                  {type === 'grupos' && <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Clase Madre</th>}
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    {type === 'clases' ? 'Capacidad Total' : type === 'grupos' ? 'Instrumentos / Docentes' : type === 'noticias' ? 'Fecha de Publicación' : 'Vínculos'}
                  </th>
                  {type === 'grupos' && <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Horario</th>}
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Estado</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...items]
                  .filter(it => {
                    if (!listSearch) return true;
                    const normalize = (text: string) => (text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const search = normalize(listSearch);
                    
                    if (type === 'alumnos' || type === 'docentes') {
                      const matchName = normalize(it.name).includes(search);
                      const matchInstruments = it.instruments?.some((ins: string) => normalize(ins).includes(search));
                      return matchName || matchInstruments;
                    }
                    if (type === 'grupos') {
                      const matchName = normalize(it.name).includes(search);
                      const matchInstruments = it.instruments?.some((ins: string) => normalize(ins).includes(search));
                      const matchTeachers = it.teacher_names?.some((t: string) => normalize(t).includes(search));
                      return matchName || matchInstruments || matchTeachers;
                    }
                    if (type === 'clases') {
                      const matchName = normalize(it.name).includes(search);
                      const classGroups = groupList?.filter(g => g.class_id === it.id) || [];
                      const matchSubGroup = classGroups.some(g => normalize(g.name).includes(search));
                      const matchSubTeacher = classGroups.some(g => g.teacher_names?.some((t: string) => normalize(t).includes(search)));
                      const matchStudent = classGroups.some(g => g.students?.some((sid: string) => normalize(studentList?.find(s => s.id === sid)?.name || "").includes(search)));
                      return matchName || matchSubGroup || matchSubTeacher || matchStudent;
                    }
                    return true;
                  })
                  .sort((a, b) => {
                    if (type === 'noticias') return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
                    return (a.name || a.title || "").toLowerCase().localeCompare((b.name || b.title || "").toLowerCase());
                  })
                  .map((it) => {
                  const associatedGroups = type === 'clases' ? groupList?.filter(g => g.class_id === it.id) : 
                                         (type === 'alumnos' ? groupList?.filter(g => g.students?.includes(it.id)) :
                                          type === 'docentes' ? groupList?.filter(g => g.teachers?.includes(it.id)) : []);
                  const totalStudents = type === 'clases' ? associatedGroups?.reduce((acc, g) => acc + (g.students?.length || 0), 0) : 0;
                  const parentClass = type === 'grupos' ? classList?.find(c => c.id === it.class_id) : null;

                  return (
                    <tr key={it.id} className={`hover:bg-slate-50/50 transition-colors group ${!it.is_active ? 'opacity-60 bg-slate-50/30' : ''}`}>
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          {type === 'alumnos' ? (
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 shadow-sm shrink-0"><UserIcon size={18} /></div>
                          ) : type === 'docentes' ? (
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 shadow-sm shrink-0"><UserIcon size={18} /></div>
                          ) : (type === 'clases' || type === 'noticias') ? (
                            <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                              {it.image_url ? <img src={it.image_url} className="w-full h-full object-cover"/> : <ImageIcon size={20} className="m-auto text-slate-300"/>}
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 shrink-0"><Users size={18} /></div>
                          )}
                          <span className="font-black text-slate-900 uppercase text-xs tracking-tight">{it.name || it.title}</span>
                        </div>
                      </td>

                      {(type === 'alumnos' || type === 'docentes') && <td className="p-5"><span className="text-xs font-bold text-slate-500">{it.age ? `${it.age} años` : '—'}</span></td>}
                      {type === 'docentes' && (
                        <td className="p-5">
                          <div className="flex flex-wrap gap-1">
                            {it.instruments?.map((ins: string) => <span key={ins} className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-emerald-100">{ins}</span>)}
                          </div>
                        </td>
                      )}
                      {type === 'grupos' && <td className="p-5"><span className="text-[10px] font-black text-slate-400 uppercase">{parentClass?.name || 'Desvinculada'}</span></td>}

                      <td className="p-5">
                        {type === 'clases' ? (
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-900 uppercase">{totalStudents} Alumnos/as</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{associatedGroups?.length || 0} Comisiones</span>
                          </div>
                        ) : type === 'grupos' ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap gap-1">
                              {it.instruments?.map((ins: string) => <span key={ins} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">{ins}</span>)}
                            </div>
                            <span className="text-[9px] font-bold text-orange-500 uppercase">{it.teacher_names?.join(', ')}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">{it.students?.length || 0} / {it.max_capacity} Cupos</span>
                          </div>
                        ) : type === 'noticias' ? (
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{it.date ? new Date(it.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sin fecha'}</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {associatedGroups.length > 0 ? associatedGroups.map((g: any) => (
                              <span key={g.id} className={`bg-${type === 'alumnos' ? 'blue' : 'emerald'}-50 text-${type === 'alumnos' ? 'blue' : 'emerald'}-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-${type === 'alumnos' ? 'blue' : 'emerald'}-100 shadow-sm`}>
                                {g.name} ({g.instruments?.[0] || 'Gral'})
                              </span>
                            )) : <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Sin asignar</span>}
                          </div>
                        )}
                      </td>

                      {type === 'grupos' && <td className="p-5"><span className="text-[10px] font-bold text-slate-600 uppercase">{it.schedule || 'S/H'}</span></td>}

                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${it.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                          {it.is_active ? 'Activo' : 'Pausado'}
                        </span>
                      </td>

                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openModal(it)} className="p-2.5 bg-slate-100 text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Edit3 size={16}/></button>
                          <button onClick={() => confirm("¿Eliminar permanentemente?") && onDelete(it.id, type)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
                  {editingItem.id ? 'Editar' : 'Crear'} {type === 'grupos' ? 'Grupo' : type === 'alumnos' ? 'Alumno/a' : type === 'docentes' ? 'Docente' : type === 'noticias' ? 'Noticia' : 'Clase'}
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
                    <button onClick={() => fileRef.current?.click()} className="text-[10px] font-black uppercase bg-slate-900 text-white px-6 py-3 rounded-xl flex gap-2 items-center tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                      <Camera size={14}/> {editingItem.image_url ? 'Cambiar Foto' : 'Subir Foto'}
                    </button>
                    <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={(type === 'noticias' || type === 'docentes') ? 'col-span-1' : ''}>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">{type === 'noticias' ? 'Título' : 'Nombre completo'}</label>
                    <input type="text" value={type === 'noticias' ? editingItem.title : editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, [type === 'noticias' ? 'title' : 'name']: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" />
                  </div>
                  {type === 'noticias' && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Fecha</label>
                      <input type="date" value={editingItem.date || ""} onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" />
                    </div>
                  )}
                  {type === 'alumnos' && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Edad</label>
                      <input type="number" value={editingItem.age || ""} onChange={(e) => setEditingItem({ ...editingItem, age: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" />
                    </div>
                  )}
                  {type === 'docentes' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Teléfono</label>
                        <input type="text" value={editingItem.phone || ""} onChange={(e) => setEditingItem({ ...editingItem, phone: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-emerald-500 transition-all outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Edad</label>
                        <input type="number" value={editingItem.age || ""} onChange={(e) => setEditingItem({ ...editingItem, age: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-emerald-500 transition-all outline-none" />
                      </div>
                    </div>
                  )}
                </div>

                {type === 'docentes' && (
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Email</label>
                    <input type="email" value={editingItem.email || ""} onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-emerald-500 transition-all outline-none" />
                  </div>
                )}

                {(type === 'alumnos' || type === 'docentes') && (
                  <div className="bg-slate-50 p-6 rounded-[2rem] ring-2 ring-slate-100 space-y-6">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block mb-4">Comisiones Vinculadas</label>
                    <div className="space-y-3">
                      {groupList?.filter(g => (type === 'alumnos' ? g.students?.includes(editingItem.id) : g.teachers?.includes(editingItem.id))).length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center"><AlertCircle size={20} className="mx-auto text-slate-200 mb-2"/><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sin comisiones activas</p></div>
                      ) : groupList?.filter(g => (type === 'alumnos' ? g.students?.includes(editingItem.id) : g.teachers?.includes(editingItem.id))).map((g: any) => (
                        <div key={g.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0"><BookOpen size={18}/></div>
                          <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start">
                              <span className="text-[11px] font-black text-slate-900 uppercase">{g.name}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">{type === 'alumnos' ? `${g.students?.length || 0} Alumnos/as` : `${g.teachers?.length || 0} Docentes`}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1"><span className="text-[8px] font-bold text-slate-400 uppercase">{g.instruments?.join(', ')}</span><span className="w-1 h-1 bg-slate-200 rounded-full"/><span className="text-[8px] font-black text-orange-500 uppercase">{g.schedule}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {type === 'docentes' && (
                  <div className="bg-slate-50 p-6 rounded-[2rem] ring-2 ring-slate-100 space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Especialidades</label>
                    <div className="flex flex-wrap gap-2">
                      {(editingItem.instruments || []).map((ins: string) => (
                        <span key={ins} className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-900 border border-slate-200 flex items-center gap-2">{ins}<button onClick={() => setEditingItem({...editingItem, instruments: editingItem.instruments.filter((i: string) => i !== ins)})} className="text-slate-400 hover:text-red-500"><X size={12}/></button></span>
                      ))}
                    </div>
                    <select onChange={(e) => e.target.value && !editingItem.instruments?.includes(e.target.value) && setEditingItem({...editingItem, instruments: [...(editingItem.instruments || []), e.target.value]})} className="w-full p-3 bg-white rounded-xl text-[10px] font-bold text-slate-500 border-none ring-1 ring-slate-200" value=""><option value="">Añadir especialidad...</option>{instruments.map(i => <option key={i} value={i}>{i}</option>)}</select>
                  </div>
                )}

                {type === 'grupos' && (
                  <>
                    <div className="bg-slate-50 p-6 rounded-[2rem] ring-2 ring-slate-100 space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Instrumentos</label>
                      <div className="flex flex-wrap gap-2">{(editingItem.instruments || []).map((ins: string) => (
                        <span key={ins} className="bg-white px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-900 border border-slate-200 flex items-center gap-2">{ins}<button onClick={() => setEditingItem({...editingItem, instruments: editingItem.instruments.filter((i: string) => i !== ins)})} className="text-slate-400 hover:text-red-500"><X size={12}/></button></span>
                      ))}</div>
                      <select onChange={(e) => e.target.value && !editingItem.instruments?.includes(e.target.value) && setEditingItem({...editingItem, instruments: [...(editingItem.instruments || []), e.target.value]})} className="w-full p-3 bg-white rounded-xl text-[10px] font-bold text-slate-500 border-none ring-1 ring-slate-200" value=""><option value="">Añadir instrumento...</option>{instruments.map(i => <option key={i} value={i}>{i}</option>)}</select>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[3rem] border-2 border-slate-100 space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Equipo Docente</label>
                      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                        {(editingItem.teachers || []).map((tid: string) => (
                          <div key={tid} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                                <UserIcon size={14}/>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                                  {teacherList.find(t => t.id === tid)?.name || 'Docente'}
                                </span>
                                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                                  {teacherList.find(t => t.id === tid)?.instruments?.join(' • ') || ''}
                                </span>
                              </div>
                            </div>
                            <button onClick={() => setEditingItem({...editingItem, teachers: editingItem.teachers.filter((id: string) => id !== tid)})} className="p-2 text-slate-300 hover:text-red-500">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-inner space-y-4">
                        <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/>
                          <input 
                            type="text" 
                            placeholder="Buscar docente por nombre..." 
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none ring-1 ring-slate-100 focus:ring-emerald-500" 
                            onChange={(e) => setSearch(e.target.value)} 
                            value={searchTerm}
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1 pr-2 scrollbar-hide">
                          {teacherList
                            .filter(t => 
                              (
                                t.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || 
                                (t.instruments || []).some((i: string) => i.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
                              ) && !(editingItem.teachers || []).includes(t.id)
                            )
                            .map(t => (
                              <button 
                                key={t.id} 
                                onClick={() => { 
                                  setEditingItem({
                                    ...editingItem, 
                                    teachers: [...(editingItem.teachers || []), t.id]
                                  }); 
                                  setSearch(""); 
                                }} 
                                className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl flex items-center justify-between group/add transition-colors"
                              >
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{t.name}</span>
                                  <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">{t.instruments?.join(' • ') || 'Sin especialidad'}</span>
                                </div>
                                <Plus size={14} className="text-slate-300 group-hover/add:text-emerald-500"/>
                              </button>
                            ))
                          }
                          {teacherList.filter(t => (
                            t.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || 
                            (t.instruments || []).some((i: string) => i.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")))
                          ) && !(editingItem.teachers || []).includes(t.id)).length === 0 && (
                            <p className="text-[9px] font-bold text-slate-300 uppercase text-center py-2 italic tracking-widest">No hay más docentes que coincidan</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Clase vinculada</label><select value={editingItem.class_id} onChange={(e) => setEditingItem({ ...editingItem, class_id: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-900 border-none ring-2 ring-slate-100">{classList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                      <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block flex gap-1 items-center"><Users size={10}/> Capacidad Máx</label><input type="number" value={editingItem.max_capacity || ""} onChange={(e) => setEditingItem({ ...editingItem, max_capacity: parseInt(e.target.value) })} className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-slate-900 border-none ring-2 ring-slate-100 focus:ring-green-500 transition-all outline-none" /></div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2rem] ring-2 ring-slate-100"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block flex gap-1 items-center"><Clock size={10}/> Día y Horario</label><input type="text" placeholder="Ej: Lunes 18:00 a 20:00" value={editingItem.schedule || ""} onChange={(e) => setEditingItem({ ...editingItem, schedule: e.target.value })} className="w-full p-4 bg-white rounded-2xl font-bold text-slate-900 border-none ring-1 ring-slate-200 focus:ring-green-500 transition-all outline-none" /></div>
                  </>
                )}

                {type === 'clases' && (
                  <div className="bg-slate-50 p-6 rounded-[3rem] border-2 border-slate-100 space-y-4">
                    <div className="flex justify-between items-center px-2"><label className="text-[10px] font-black uppercase text-slate-400 block">Comisiones Asociadas</label><div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm"><Users size={12} className="text-slate-400" /><span className="text-[10px] font-black text-slate-900 uppercase">Total: {groupList?.filter(g => g.class_id === editingItem.id).reduce((acc, g) => acc + (g.students?.length || 0), 0)} Alumnos/as</span></div></div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                      {groupList?.filter(g => g.class_id === editingItem.id).length === 0 ? <p className="text-[9px] font-bold text-slate-300 uppercase text-center py-4 italic">No hay grupos vinculados aún</p> : groupList?.filter(g => g.class_id === editingItem.id).map((g: any) => (
                        <div key={g.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm"><div className="flex flex-col"><div className="flex items-center gap-3"><span className="text-[11px] font-black text-slate-900 uppercase">{g.name}</span><span className="text-[8px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-md">{g.students?.length || 0} Alumnos/as</span></div><span className="text-[8px] font-bold text-slate-400 uppercase">{g.instruments?.join(' • ')} • {g.teacher_names?.join(', ')}</span></div><div className="p-2 bg-slate-50 rounded-xl text-green-500"><CheckCircle2 size={16}/></div></div>
                      ))}
                    </div>
                  </div>
                )}

                {type === 'grupos' && (
                  <div className="bg-slate-50 p-6 rounded-[3rem] border-2 border-slate-100 space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2 block">Integrantes del Grupo</label>
                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                      {(editingItem.students || []).map((sid: string) => (
                        <div key={sid} className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between ${!studentList.find(sl => sl.id === sid)?.is_active ? 'opacity-50' : ''}`}><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${!studentList.find(sl => sl.id === sid)?.is_active ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-500'}`}><UserIcon size={14}/></div><div className="flex flex-col"><div className="flex items-center gap-2"><span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{studentList.find(sl => sl.id === sid)?.name}</span>{!studentList.find(sl => sl.id === sid)?.is_active && <span className="bg-red-50 text-red-500 text-[7px] font-black uppercase px-1.5 py-0.5 rounded border border-red-100">Inactivo</span>}</div><span className="text-[9px] font-bold text-slate-400 uppercase">Alumno/a</span></div></div><button onClick={() => setEditingItem({ ...editingItem, students: editingItem.students.filter((id: string) => id !== sid) })} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div>
                      ))}
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-inner space-y-4"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16}/><input type="text" placeholder="Buscar alumno..." className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl text-[10px] font-bold outline-none ring-1 ring-slate-100 focus:ring-green-500" onChange={(e) => setSearch(e.target.value)} value={searchTerm}/></div><div className="max-h-40 overflow-y-auto space-y-1 pr-2 scrollbar-hide">{studentList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !editingItem.students.includes(s.id)).map(s => (<button key={s.id} onClick={() => { setEditingItem({ ...editingItem, students: [...editingItem.students, s.id] }); setSearch(""); }} className="w-full text-left p-3 hover:bg-green-50 rounded-xl flex items-center justify-between group/add transition-colors"><span className="text-[10px] font-bold text-slate-600 uppercase">{s.name}</span><Plus size={14} className="text-slate-300 group-hover/add:text-green-500"/></button>))}</div></div>
                  </div>
                )}

                {(type !== 'grupos' && type !== 'alumnos' && type !== 'docentes') && (
                  <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Descripción / Resumen</label><textarea rows={3} value={editingItem.description || ""} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-700 border-none ring-2 ring-slate-100" /></div>
                )}

                {type === 'docentes' && (
                  <div><label className="text-[10px] font-black uppercase text-slate-400 ml-2 mb-2 block">Experiencia</label><textarea rows={4} value={editingItem.experience || ""} onChange={(e) => setEditingItem({ ...editingItem, experience: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-700 border-none ring-2 ring-slate-100" placeholder="Estudios, trayectoria..." /></div>
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

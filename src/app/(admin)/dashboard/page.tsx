"use client";
import { useEffect, useState } from "react";
import { 
  getCollectionAdmin, upsertItemAdmin, deleteItemAdmin,
  getInstrumentsAdmin, updateInstrumentsAdmin,
  getTeachersAdmin, updateTeachersAdmin,
  getGlobalSettingsAdmin, updateGlobalSettingsAdmin,
  getAdminsAdmin, updateAdminsAdmin 
} from "@/services/admin-services";
import { Class, News } from "@/types";
import { 
  Plus, Music, Newspaper, Settings2, RefreshCw, 
  ChevronRight, Save, Mail, Phone, MapPin, Instagram, Facebook, 
  YoutubeIcon, Users, X, Clock, CheckCircle, MessageSquare, Inbox, Trash2, ShieldCheck,
  Youtube, GraduationCap, AlertCircle, CheckCircle2, ListFilter
} from "lucide-react";
import CollectionManager from "../components/CollectionManager";
import ListManager from "../components/ListManager";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [viewManager, setViewManager] = useState<"clases" | "noticias" | null>(null);
  const [viewList, setViewList] = useState<"teachers" | "instruments" | "admins" | null>(null);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // FILTROS DE CONSULTAS
  const [filterCategory, setFilterCategory] = useState<'all' | 'contacto' | 'clases'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'nuevo' | 'gestionado'>('nuevo');

  const [data, setData] = useState({
    clases: [] as Class[],
    noticias: [] as News[],
    submissions: [] as any[],
    teachers: [] as string[],
    instruments: [] as string[],
    admins: [] as string[],
    settings: {} as any
  });

  const showStatus = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3000);
  };

  const refreshData = async () => {
    setLoading(true);
    const [resC, resN, resS, resI, resT, resG, resA] = await Promise.all([
      getCollectionAdmin("clases"),
      getCollectionAdmin("noticias"),
      getSubmissionsAdmin(),
      getInstrumentsAdmin(),
      getTeachersAdmin(),
      getGlobalSettingsAdmin(),
      getAdminsAdmin()
    ]);
    
    setData({
      clases: (resC.data || []) as Class[],
      noticias: (resN.data || []) as News[],
      submissions: resS.data || [],
      instruments: resI.data || [],
      teachers: resT.data || [],
      admins: resA.data || [],
      settings: resG.data || {}
    });
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  async function getSubmissionsAdmin() {
    const q = query(collection(db, "submissions"), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
  }

  const filteredSubmissions = data.submissions.filter(sub => {
    const matchCat = filterCategory === 'all' || sub.type === filterCategory;
    if (filterStatus === 'nuevo') return matchCat && sub.status !== 'gestionado';
    if (filterStatus === 'gestionado') return matchCat && sub.status === 'gestionado';
    return matchCat;
  });

  const stats = {
    total: data.submissions.length,
    pending: data.submissions.filter(s => s.status !== 'gestionado').length,
    contacts: data.submissions.filter(s => s.type === 'contacto').length,
    enrolls: data.submissions.filter(s => s.type === 'clases').length
  };

  const handleUpdateSettings = async (newData: any) => {
    const res = await updateGlobalSettingsAdmin(newData);
    if (res.success) { showStatus('success', 'Configuración guardada'); refreshData(); }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("¿Eliminar permanentemente?")) return;
    await deleteDoc(doc(db, "submissions", id));
    showStatus('success', 'Registro eliminado');
    setSelectedSub(null);
    refreshData();
  };

  const updateSubStatus = async (sub: any) => {
    const isCurrentlyManaged = sub.status === 'gestionado';
    let nextStatus = isCurrentlyManaged ? (sub.type === 'clases' ? 'pendiente' : 'nuevo') : 'gestionado';
    await updateDoc(doc(db, "submissions", sub.id), { status: nextStatus });
    showStatus('success', isCurrentlyManaged ? 'Registro reabierto' : 'Registro gestionado');
    refreshData();
    setSelectedSub(null);
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Panel Central</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Escuela de Música Barrial</p>
        </div>
        <button onClick={refreshData} className="p-4 bg-white rounded-2xl border-2 border-slate-100 hover:border-slate-900 transition-all text-slate-900 shadow-sm">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA: CONTENIDOS Y CONSULTAS */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* SECCIÓN 1: GRANDES BOTONES DE CONTENIDO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setViewManager("clases")} className="group p-10 bg-white rounded-[3.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all text-left space-y-6 shadow-sm hover:shadow-2xl shadow-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Music size={32} />
              </div>
              <div>
                <h3 className="font-black uppercase text-2xl tracking-tighter text-slate-900 leading-none">Clases y Talleres</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{data.clases.length} Publicaciones activas</p>
              </div>
            </button>

            <button onClick={() => setViewManager("noticias")} className="group p-10 bg-white rounded-[3.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all text-left space-y-6 shadow-sm hover:shadow-2xl shadow-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Newspaper size={32} />
              </div>
              <div>
                <h3 className="font-black uppercase text-2xl tracking-tighter text-slate-900 leading-none">Novedades y Eventos</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{data.noticias.length} Entradas en el blog</p>
              </div>
            </button>
          </div>

          {/* SECCIÓN 2: BANDEJA DE CONSULTAS OPTIMIZADA */}
          <section className="bg-white rounded-[4rem] p-10 md:p-12 border-2 border-slate-100 shadow-sm space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
                    <p className="text-[8px] font-black uppercase opacity-40 mb-1">Pendientes</p>
                    <p className="text-4xl font-black leading-none">{stats.pending}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2.5rem] text-slate-900 border border-slate-100 text-center md:text-left">
                    <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Inscripciones</p>
                    <p className="text-3xl font-black leading-none">{stats.enrolls}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2.5rem] text-slate-900 border border-slate-100 text-center md:text-left">
                    <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Consultas</p>
                    <p className="text-3xl font-black leading-none">{stats.contacts}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2.5rem] text-slate-900 border border-slate-100 text-center md:text-left">
                    <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Total Histórico</p>
                    <p className="text-3xl font-black leading-none">{stats.total}</p>
                </div>
            </div>

            <div className="flex flex-col gap-6 border-t border-slate-50 pt-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex bg-slate-50 p-2 rounded-2xl gap-1 border border-slate-100">
                        {['all', 'contacto', 'clases'].map(t => (
                            <button key={t} onClick={() => setFilterCategory(t as any)}
                                className={`px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all
                                ${filterCategory === t ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                                {t === 'all' ? 'Ver Todo' : t === 'contacto' ? 'Consultas' : 'Inscripciones'}
                            </button>
                        ))}
                    </div>

                    <div className="flex bg-slate-50 p-2 rounded-2xl gap-1 border border-slate-100">
                        {['all', 'nuevo', 'gestionado'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s as any)}
                                className={`px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all
                                ${filterStatus === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                                {s === 'all' ? 'Todo' : s === 'nuevo' ? 'Sin Leer' : 'Leídos'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
              {filteredSubmissions.length === 0 ? (
                <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[4rem]">
                    <ListFilter size={40} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-[11px] font-black uppercase text-slate-300 tracking-[0.2em]">No hay mensajes en esta sección</p>
                </div>
              ) : (
                filteredSubmissions.map((sub: any) => (
                    <motion.div layout key={sub.id} onClick={() => setSelectedSub(sub)} 
                        className={`flex items-center justify-between p-7 rounded-[2.5rem] border-2 cursor-pointer transition-all group
                        ${sub.status === 'gestionado' ? 'bg-slate-50/50 border-transparent opacity-50' : 'bg-white border-slate-50 hover:border-slate-900 shadow-sm'}`}>
                        
                        <div className="flex items-center gap-6">
                            <div className={`w-3.5 h-3.5 rounded-full ${sub.status === 'gestionado' ? 'bg-slate-200' : sub.type === 'clases' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`} />
                            <div>
                                <h4 className="font-black uppercase text-[13px] tracking-tight text-slate-900 group-hover:translate-x-1 transition-transform">{sub.fullname}</h4>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${sub.type === 'clases' ? 'text-orange-400' : 'text-blue-400'}`}>
                                        {sub.type === 'clases' ? sub.role : 'Consulta General'}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[9px] font-bold text-slate-400 italic">{sub.instrument || sub.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                        </div>
                    </motion.div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* COLUMNA DERECHA: CONFIGURACIÓN GENERAL Y LISTAS */}
        <div className="space-y-8">
          {/* CONFIGURACIÓN CON ALTO CONTRASTE Y REDES */}
          <section className="bg-slate-900 text-white rounded-[4rem] p-10 md:p-12 space-y-10 shadow-2xl shadow-slate-300">
            <div className="flex items-center gap-4">
              <Settings2 size={28} />
              <h2 className="font-black uppercase text-sm tracking-[0.2em]">Configuración</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-5 flex items-center gap-2"><Phone size={12}/> Teléfono de la Escuela</label>
                <input type="text" value={data.settings.phone || ""} onChange={(e) => setData({...data, settings: {...data.settings, phone: e.target.value}})} className="w-full bg-slate-800 border-none rounded-2xl p-5 font-bold text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all text-white"/>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-500 ml-5 flex items-center gap-2"><Mail size={12}/> Email Oficial</label>
                <input type="text" value={data.settings.email || ""} onChange={(e) => setData({...data, settings: {...data.settings, email: e.target.value}})} className="w-full bg-slate-800 border-none rounded-2xl p-5 font-bold text-sm outline-none focus:ring-2 focus:ring-white/20 transition-all text-white"/>
              </div>
              
              <div className="pt-4 space-y-4 border-t border-slate-800">
                  <p className="text-[9px] font-black uppercase text-slate-500 mb-2">Redes Sociales</p>
                  {['instagram', 'facebook', 'youtube'].map(red => (
                    <div key={red} className="flex items-center gap-4 bg-slate-800 p-3 rounded-2xl border border-transparent focus-within:border-slate-600 transition-all">
                      <div className="p-2.5 bg-slate-700 rounded-xl text-slate-300">
                         {red === 'instagram' ? <Instagram size={16}/> : red === 'facebook' ? <Facebook size={16}/> : <Youtube size={16}/>}
                      </div>
                      <input type="text" placeholder={`Usuario / Link de ${red}`} value={data.settings[red] || ""} onChange={(e) => setData({...data, settings: {...data.settings, [red]: e.target.value}})} className="bg-transparent border-none w-full text-xs font-bold outline-none text-white placeholder:text-slate-600"/>
                    </div>
                  ))}
              </div>

              <button onClick={() => handleUpdateSettings(data.settings)} className="w-full py-6 bg-white text-slate-900 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] hover:bg-green-400 transition-all flex items-center justify-center gap-3 mt-6 shadow-xl shadow-slate-900/60">
                <Save size={20} /> Guardar Todo
              </button>
            </div>
          </section>

          {/* LISTAS DE GESTIÓN */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setViewList("teachers")} className="flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-slate-900 transition-all gap-4 group shadow-sm">
              <div className="p-5 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><Users size={32} className="text-slate-900 group-hover:text-white" /></div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 text-center">Base de Docentes</span>
            </button>

            <button onClick={() => setViewList("instruments")} className="flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-slate-900 transition-all gap-4 group shadow-sm">
              <div className="p-5 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><Music size={32} className="text-slate-900 group-hover:text-white" /></div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 text-center">Lista de Instrumentos</span>
            </button>

            <button onClick={() => setViewList("admins")} className="col-span-2 flex flex-col items-center justify-center p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-slate-900 transition-all gap-4 group shadow-sm">
              <div className="p-5 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><ShieldCheck size={32} className="text-slate-900 group-hover:text-white" /></div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900">Control de Administradores</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETALLE DE CONSULTA */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSub(null)} className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[4.5rem] overflow-hidden shadow-2xl">
              <div className="p-12 md:p-16 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedSub.type === 'clases' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {selectedSub.type === 'clases' ? selectedSub.role : 'Consulta Web'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{selectedSub.created_at?.toDate ? new Date(selectedSub.created_at.toDate()).toLocaleString() : ''}</span>
                    </div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-[0.9]">{selectedSub.fullname}</h2>
                  </div>
                  <button onClick={() => setSelectedSub(null)} className="p-5 bg-slate-50 rounded-full text-slate-900 hover:bg-slate-100 transition-all"><X size={24}/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Canal de Correo</p>
                    <p className="font-bold text-slate-900 text-sm break-all">{selectedSub.email}</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Contacto Directo</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedSub.phone || "---"}</p>
                  </div>
                </div>

                {selectedSub.type === 'clases' ? (
                  <div className="p-10 bg-orange-50/50 rounded-[3rem] border border-orange-100 grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-[9px] font-black uppercase text-orange-400 mb-2">Instrumento</p>
                        <p className="font-black text-orange-900 text-xl tracking-tight leading-none">{selectedSub.instrument}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black uppercase text-orange-400 mb-2">Experiencia</p>
                        <p className="font-black text-orange-900 text-xl tracking-tight leading-none">{selectedSub.level_or_experience}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 bg-blue-50/30 rounded-[3rem] border border-blue-100">
                    <p className="text-[9px] font-black uppercase text-blue-400 mb-3">Contenido del Mensaje</p>
                    <p className="font-medium text-slate-700 leading-relaxed text-base italic">"{selectedSub.message}"</p>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-5 pt-6">
                  <button onClick={() => updateSubStatus(selectedSub)}
                    className={`flex-1 py-6 rounded-[2.2rem] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${selectedSub.status === 'gestionado' ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white hover:bg-green-600'}`}>
                    <CheckCircle size={20}/> {selectedSub.status === 'gestionado' ? "Marcar como Pendiente" : "Completar Gestión"}
                  </button>
                  <button onClick={() => deleteSubmission(selectedSub.id)} className="p-6 bg-red-50 text-red-500 rounded-[2.2rem] hover:bg-red-500 hover:text-white transition-all shadow-xl">
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP DE NOTIFICACIÓN */}
      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 50, x: "-50%" }}
            className={`fixed z-[1000] bottom-10 left-1/2 px-10 py-5 rounded-full shadow-2xl flex items-center gap-4 z-[150] border bg-slate-900 text-white ${status.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            {status.type === 'success' ? <CheckCircle2 size={20} className="text-green-500" /> : <AlertCircle size={20} className="text-red-500" />}
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">{status.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPONENTES DE GESTIÓN */}
      {viewManager && (
        <CollectionManager 
          type={viewManager} items={viewManager === "clases" ? data.clases : data.noticias}
          teachers={data.teachers} instruments={data.instruments}
          onClose={() => setViewManager(null)}
          onUpsert={async (item) => { 
            const res = await upsertItemAdmin(viewManager!, item); 
            if (res.success) { showStatus('success', 'Cambios guardados con éxito'); refreshData(); } 
          }}
          onDelete={async (id) => { 
            const res = await deleteItemAdmin(viewManager!, id); 
            if (res.success) { showStatus('success', 'Eliminado correctamente'); refreshData(); }
          }}
        />
      )}
      {viewList && (
        <ListManager
          title={viewList === "teachers" ? "Base de Docentes" : viewList === "instruments" ? "Lista de Instrumentos" : "Administradores"}
          list={viewList === "teachers" ? data.teachers : viewList === "instruments" ? data.instruments : data.admins}
          onClose={() => setViewList(null)}
          onUpdate={async (newList) => {
            let res;
            if (viewList === "teachers") res = await updateTeachersAdmin(newList);
            else if (viewList === "instruments") res = await updateInstrumentsAdmin(newList);
            else res = await updateAdminsAdmin(newList);
            if (res.success) { showStatus('success', 'Lista actualizada'); refreshData(); }
          }}
        />
      )}
    </div>
  );
}
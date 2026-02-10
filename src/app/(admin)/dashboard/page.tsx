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
  Youtube, GraduationCap, UserRound, Briefcase
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
  const [submissionModal, setSubmissionModal] = useState<{ type: string, items: any[] } | null>(null);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  const [data, setData] = useState({
    clases: [] as Class[],
    noticias: [] as News[],
    submissions: [] as any[],
    teachers: [] as string[],
    instruments: [] as string[],
    admins: [] as string[],
    settings: {} as any
  });

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
      clases: resC.data || [],
      noticias: resN.data || [],
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
    // Traemos de la colección "submissions" ordenada por fecha
    const q = query(collection(db, "submissions"), orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return { data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
  }

  const handleUpdateSettings = async (newData: any) => {
    const res = await updateGlobalSettingsAdmin(newData);
    if (res.success) refreshData();
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("¿Eliminar este registro de forma permanente?")) return;
    await deleteDoc(doc(db, "submissions", id));
    setSelectedSub(null);
    refreshData();
  };

  const updateSubStatus = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "submissions", id), { status: newStatus });
    refreshData();
    setSelectedSub(null);
  };

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Panel Central</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de la Escuela de Música</p>
        </div>
        <button 
          onClick={refreshData} 
          className="p-4 bg-white rounded-2xl border-2 border-slate-100 hover:border-slate-900 transition-all text-slate-900 shadow-sm"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA 1: CONTENIDOS Y CONSULTAS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setViewManager("clases")}
              className="group p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-slate-900 transition-all text-left space-y-4 shadow-sm hover:shadow-2xl shadow-slate-200"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Music size={28} />
              </div>
              <div>
                <h3 className="font-black uppercase text-lg tracking-tighter text-slate-900">Clases y Talleres</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.clases.length} Publicadas</p>
              </div>
            </button>

            <button 
              onClick={() => setViewManager("noticias")}
              className="group p-8 bg-white rounded-[3rem] border-2 border-slate-100 hover:border-slate-900 transition-all text-left space-y-4 shadow-sm hover:shadow-2xl shadow-slate-200"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Newspaper size={28} />
              </div>
              <div>
                <h3 className="font-black uppercase text-lg tracking-tighter text-slate-900">Noticias y Eventos</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.noticias.length} Entradas</p>
              </div>
            </button>
          </div>

          {/* BANDEJA DE ENTRADA MEJORADA */}
          <section className="bg-white rounded-[3.5rem] p-10 border-2 border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                    <Inbox size={20} />
                </div>
                <h2 className="font-black uppercase text-xs tracking-[0.2em] text-slate-900">Bandeja de Entrada</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSubmissionModal({ type: "Contacto", items: data.submissions.filter(s => s.type === "contacto") })}
                  className="px-6 py-3 bg-slate-50 text-slate-900 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                >
                  Consultas
                </button>
                <button 
                  onClick={() => setSubmissionModal({ type: "Inscripciones", items: data.submissions.filter(s => s.type === "clases") })}
                  className="px-6 py-3 bg-slate-50 text-slate-900 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                >
                  Inscripciones
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {data.submissions.length === 0 ? (
                <p className="text-center py-10 text-[10px] font-bold uppercase text-slate-400 tracking-widest">No hay nuevas consultas</p>
              ) : (
                data.submissions.slice(0, 6).map((sub: any) => (
                  <div 
                    key={sub.id} 
                    onClick={() => setSelectedSub(sub)}
                    className={`flex items-center justify-between p-5 rounded-3xl border-2 cursor-pointer transition-all
                      ${sub.status === 'gestionado' ? 'bg-slate-50/50 border-transparent opacity-60' : 'bg-white border-slate-50 hover:border-slate-900 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-2 h-2 rounded-full ${
                        sub.status === 'gestionado' ? 'bg-slate-300' : 
                        sub.type === 'clases' ? 'bg-orange-500 animate-pulse' : 'bg-blue-500 animate-pulse'
                      }`} />
                      <div>
                        <p className="font-black uppercase text-[10px] tracking-tighter text-slate-900">{sub.fullname}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          {sub.type === 'clases' ? `${sub.role} - ${sub.instrument}` : 'Consulta General'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden md:block text-[8px] font-black uppercase text-slate-300 tracking-widest">
                            {sub.created_at?.toDate ? new Date(sub.created_at.toDate()).toLocaleDateString() : ''}
                        </span>
                        <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* COLUMNA 2: CONFIGURACIÓN Y LISTAS */}
        <div className="space-y-8">
          <section className="bg-slate-900 text-white rounded-[3.5rem] p-10 space-y-8 shadow-2xl shadow-slate-300">
            <div className="flex items-center gap-4">
              <Settings2 size={24} />
              <h2 className="font-black uppercase text-xs tracking-[0.2em]">Configuración General</h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-slate-500 ml-4 flex items-center gap-2">
                    <Phone size={10}/> Teléfono
                </label>
                <input 
                  type="text" 
                  value={data.settings.phone || ""} 
                  onChange={(e) => setData({...data, settings: {...data.settings, phone: e.target.value}})}
                  className="w-full bg-slate-800 border-none rounded-2xl p-4 font-bold text-xs outline-none focus:ring-2 focus:ring-white/20 transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase text-slate-500 ml-4 flex items-center gap-2">
                    <Mail size={10}/> Email Principal
                </label>
                <input 
                  type="text" 
                  value={data.settings.email || ""} 
                  onChange={(e) => setData({...data, settings: {...data.settings, email: e.target.value}})}
                  className="w-full bg-slate-800 border-none rounded-2xl p-4 font-bold text-xs outline-none focus:ring-2 focus:ring-white/20 transition-all text-white"
                />
              </div>
              
              <div className="pt-2 space-y-4">
                  <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-2xl">
                      <div className="p-2 bg-slate-700 rounded-lg text-pink-400"><Instagram size={14}/></div>
                      <input 
                        type="text" placeholder="Usuario"
                        value={data.settings.instagram || ""} 
                        onChange={(e) => setData({...data, settings: {...data.settings, instagram: e.target.value}})}
                        className="bg-transparent border-none w-full text-xs font-bold outline-none text-white"
                      />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-2xl">
                      <div className="p-2 bg-slate-700 rounded-lg text-blue-400"><Facebook size={14}/></div>
                      <input 
                        type="text" placeholder="Link"
                        value={data.settings.facebook || ""} 
                        onChange={(e) => setData({...data, settings: {...data.settings, facebook: e.target.value}})}
                        className="bg-transparent border-none w-full text-xs font-bold outline-none text-white"
                      />
                  </div>
                  <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-2xl">
                      <div className="p-2 bg-slate-700 rounded-lg text-red-500"><Youtube size={14}/></div>
                      <input 
                        type="text" placeholder="Link"
                        value={data.settings.youtube || ""} 
                        onChange={(e) => setData({...data, settings: {...data.settings, youtube: e.target.value}})}
                        className="bg-transparent border-none w-full text-xs font-bold outline-none text-white"
                      />
                  </div>
              </div>

              <button 
                onClick={() => handleUpdateSettings(data.settings)}
                className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-green-400 transition-all flex items-center justify-center gap-3 mt-4"
              >
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setViewList("teachers")} className="flex flex-col items-center justify-center p-6 bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all gap-3 group">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Users size={24} className="text-slate-900 group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Docentes</span>
            </button>

            <button onClick={() => setViewList("instruments")} className="flex flex-col items-center justify-center p-6 bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all gap-3 group">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <Music size={24} className="text-slate-900 group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Instrumentos</span>
            </button>

            <button onClick={() => setViewList("admins")} className="col-span-2 flex flex-col items-center justify-center p-6 bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all gap-3 group">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-colors">
                <ShieldCheck size={24} className="text-slate-900 group-hover:text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Gestionar Administradores</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALLE DE CONSULTA (DINÁMICO) */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSub(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl">
              <div className="p-10 md:p-14 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                        {selectedSub.type === 'clases' ? (
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedSub.role === 'docente' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                {selectedSub.role}
                            </span>
                        ) : (
                            <span className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                                Consulta General
                            </span>
                        )}
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                            {selectedSub.created_at?.toDate ? new Date(selectedSub.created_at.toDate()).toLocaleString() : ''}
                        </span>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">{selectedSub.fullname}</h2>
                  </div>
                  <button onClick={() => setSelectedSub(null)} className="p-4 bg-slate-50 rounded-full hover:bg-slate-100 transition-all text-slate-900"><X size={20}/></button>
                </div>
                
                {/* INFO DE CONTACTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-1 border border-slate-100">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Mail size={10}/> Email de contacto</p>
                    <p className="font-bold text-slate-900 text-sm break-all">{selectedSub.email}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl space-y-1 border border-slate-100">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Phone size={10}/> Teléfono / WhatsApp</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedSub.phone || "No especificado"}</p>
                  </div>
                </div>

                {/* INFO ESPECÍFICA SEGÚN TIPO */}
                {selectedSub.type === 'clases' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-orange-50/50 rounded-3xl space-y-1 border border-orange-100">
                      <p className="text-[8px] font-black uppercase text-orange-400 tracking-widest flex items-center gap-2"><Music size={10}/> Instrumento</p>
                      <p className="font-bold text-orange-900 text-sm">{selectedSub.instrument}</p>
                    </div>
                    <div className="p-6 bg-orange-50/50 rounded-3xl space-y-1 border border-orange-100">
                      <p className="text-[8px] font-black uppercase text-orange-400 tracking-widest flex items-center gap-2"><GraduationCap size={10}/> Experiencia</p>
                      <p className="font-bold text-orange-900 text-sm">{selectedSub.level_or_experience}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-blue-50/30 rounded-[2.5rem] space-y-3 border border-blue-100">
                    <p className="text-[8px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2"><MessageSquare size={10}/> Mensaje recibido</p>
                    <p className="font-medium text-slate-700 leading-relaxed text-sm italic">"{selectedSub.message}"</p>
                  </div>
                )}

                {/* ACCIONES */}
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => updateSubStatus(selectedSub.id, selectedSub.status === 'gestionado' ? 'pendiente' : 'gestionado')}
                    className={`flex-1 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl
                        ${selectedSub.status === 'gestionado' ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white hover:bg-green-600'}`}
                  >
                    <CheckCircle size={16}/> {selectedSub.status === 'gestionado' ? "Reabrir Consulta" : "Marcar como Gestionado"}
                  </button>
                  <button 
                    onClick={() => deleteSubmission(selectedSub.id)}
                    className="p-5 bg-red-50 text-red-500 rounded-[2rem] hover:bg-red-500 hover:text-white transition-all shadow-xl flex items-center justify-center"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALES DE LISTAS (POR TIPO) */}
      <AnimatePresence>
        {submissionModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSubmissionModal(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-black uppercase text-xl tracking-tighter text-slate-900">Bandeja de {submissionModal.type}</h3>
                        <button onClick={() => setSubmissionModal(null)} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900"><X size={18}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-10 space-y-4">
                        {submissionModal.items.length === 0 ? (
                            <p className="text-center py-20 text-[10px] font-bold uppercase text-slate-300 tracking-widest">No hay registros en esta categoría</p>
                        ) : (
                            submissionModal.items.map((sub: any) => (
                                <div key={sub.id} onClick={() => { setSelectedSub(sub); setSubmissionModal(null); }} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] cursor-pointer hover:bg-slate-900 group transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'gestionado' ? 'bg-slate-300' : 'bg-green-500'}`} />
                                        <div>
                                            <p className="font-black uppercase text-[10px] tracking-tight text-slate-900 group-hover:text-white">{sub.fullname}</p>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{sub.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[8px] font-black text-slate-300 uppercase">{sub.instrument || sub.type}</span>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-white" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* GESTORES DE COLECCIONES Y LISTAS */}
      {viewManager && (
        <CollectionManager 
          type={viewManager}
          items={viewManager === "clases" ? data.clases : data.noticias}
          teachers={data.teachers}
          instruments={data.instruments}
          onClose={() => setViewManager(null)}
          onUpsert={async (item) => { await upsertItemAdmin(viewManager!, item); refreshData(); }}
          onDelete={async (id) => { await deleteItemAdmin(viewManager!, id); refreshData(); }}
        />
      )}

      {viewList && (
        <ListManager
          title={
            viewList === "teachers" ? "Base de Docentes" : 
            viewList === "instruments" ? "Lista de Instrumentos" : 
            "Administradores Permitidos"
          }
          list={
            viewList === "teachers" ? data.teachers : 
            viewList === "instruments" ? data.instruments : 
            data.admins
          }
          onClose={() => setViewList(null)}
          onUpdate={async (newList) => {
            if (viewList === "teachers") await updateTeachersAdmin(newList);
            else if (viewList === "instruments") await updateInstrumentsAdmin(newList);
            else await updateAdminsAdmin(newList);
            refreshData();
          }}
        />
      )}
    </div>
  );
}

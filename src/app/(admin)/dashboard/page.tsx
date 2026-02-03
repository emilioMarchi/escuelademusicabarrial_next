"use client";
import { useEffect, useState } from "react";
import { 
  getCollectionAdmin, upsertItemAdmin, deleteItemAdmin,
  getInstrumentsAdmin, updateInstrumentsAdmin,
  getTeachersAdmin, updateTeachersAdmin,
  getGlobalSettingsAdmin, updateGlobalSettingsAdmin 
} from "@/services/admin-services";
import { Class, News } from "@/types";
import { 
  Plus, Music, Newspaper, Settings2, RefreshCw, 
  ChevronRight, Save, Mail, Phone, MapPin, Instagram, Facebook, 
  YoutubeIcon, Users, X, Clock, CheckCircle, MessageSquare, Inbox, Trash2
} from "lucide-react";
import CollectionManager from "../components/CollectionManager";
import ListManager from "../components/ListManager";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [viewManager, setViewManager] = useState<"clases" | "noticias" | null>(null);
  const [viewList, setViewList] = useState<"teachers" | "instruments" | null>(null);
  const [submissionModal, setSubmissionModal] = useState<{ type: string, items: any[] } | null>(null);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  const [data, setData] = useState({
    clases: [] as Class[],
    noticias: [] as News[],
    instruments: [] as string[],
    teachers: [] as string[],
    submissions: [] as any[],
    general: { 
      email: "", phone: "", address: "", 
      instagram: "", facebook: "", youtube: "" 
    }
  });

  const refreshData = async () => {
    setLoading(true);
    try {
      const [clases, noticias, inst, teach, gen] = await Promise.all([
        getCollectionAdmin("clases"),
        getCollectionAdmin("noticias"),
        getInstrumentsAdmin(),
        getTeachersAdmin(),
        getGlobalSettingsAdmin()
      ]);

      const subQuery = query(collection(db, "submissions"), orderBy("created_at", "desc"));
      const subSnap = await getDocs(subQuery);
      const submissions = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setData({
        clases: clases.success ? clases.data : [],
        noticias: noticias.success ? noticias.data : [],
        instruments: inst.success ? inst.data : [],
        teachers: teach.success ? teach.data : [],
        submissions: submissions,
        general: gen.success ? gen.data : { 
          email: "", phone: "", address: "", 
          instagram: "", facebook: "", youtube: "" 
        }
      });
    } catch (e) {
      console.error("Error al refrescar datos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const markAsRead = async (id: string) => {
    try {
      const docRef = doc(db, "submissions", id);
      await updateDoc(docRef, { status: 'leído' });
      
      const updateList = (list: any[]) => list.map(s => s.id === id ? { ...s, status: 'leído' } : s);

      setData(prev => ({ ...prev, submissions: updateList(prev.submissions) }));
      if (submissionModal) {
        setSubmissionModal(prev => prev ? { ...prev, items: updateList(prev.items) } : null);
      }
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub((prev: any) => ({ ...prev, status: 'leído' }));
      }
    } catch (e) {
      alert("Error al marcar como leído");
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.")) return;

    try {
      await deleteDoc(doc(db, "submissions", id));
      
      // Actualizar estados locales
      const filterList = (list: any[]) => list.filter(s => s.id !== id);
      
      setData(prev => ({ ...prev, submissions: filterList(prev.submissions) }));
      
      if (submissionModal) {
        setSubmissionModal(prev => prev ? { ...prev, items: filterList(prev.items) } : null);
      }
      
      setSelectedSub(null);
    } catch (e) {
      alert("Error al intentar eliminar el registro.");
    }
  };

  const saveGeneralSettings = async () => {
    setLoading(true);
    const res = await updateGlobalSettingsAdmin(data.general);
    if (res.success) alert("✓ Configuración actualizada");
    setLoading(false);
  };

  const getStats = (items: any[]) => {
    const pendientes = items.filter(s => s.status !== 'leído').length;
    return { pendientes, total: items.length };
  };

  const consultas = data.submissions.filter(s => s.type === 'contacto');
  const inscripciones = data.submissions.filter(s => s.role === 'estudiante' || s.type === 'inscripcion');
  const postulaciones = data.submissions.filter(s => s.role === 'docente');

  const cStats = getStats(consultas);
  const iStats = getStats(inscripciones);
  const pStats = getStats(postulaciones);

  return (
    <div className="space-y-12 pb-32">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Panel Principal</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">EMB Gestión de Contenidos</p>
        </div>
        <button onClick={refreshData} disabled={loading} className="p-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all shadow-sm cursor-pointer">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* BARRA DE COMUNICACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => setSubmissionModal({ type: 'Consultas de Contacto', items: consultas })} 
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-slate-900 cursor-pointer transition-all">
          <div className={`p-4 rounded-2xl transition-colors ${cStats.pendientes > 0 ? 'bg-slate-900 text-white group-hover:bg-green-500' : 'bg-slate-100 text-slate-400'}`}>
            <Mail size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Consultas</h4>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-black ${cStats.pendientes > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{cStats.pendientes}</p>
              <p className="text-[10px] font-bold text-slate-400">/ {cStats.total} total</p>
            </div>
          </div>
        </div>

        <div onClick={() => setSubmissionModal({ type: 'Inscripciones de Alumnos', items: inscripciones })} 
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-slate-900 cursor-pointer transition-all">
          <div className={`p-4 rounded-2xl transition-colors ${iStats.pendientes > 0 ? 'bg-slate-900 text-white group-hover:bg-blue-500' : 'bg-slate-100 text-slate-400'}`}>
            <Music size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inscripciones</h4>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-black ${iStats.pendientes > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{iStats.pendientes}</p>
              <p className="text-[10px] font-bold text-slate-400">/ {iStats.total} total</p>
            </div>
          </div>
        </div>

        <div onClick={() => setSubmissionModal({ type: 'Postulaciones de Staff', items: postulaciones })} 
          className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-slate-900 cursor-pointer transition-all">
          <div className={`p-4 rounded-2xl transition-colors ${pStats.pendientes > 0 ? 'bg-slate-900 text-white group-hover:bg-orange-500' : 'bg-slate-100 text-slate-400'}`}>
            <Users size={24} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Docentes</h4>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-black ${pStats.pendientes > 0 ? 'text-slate-900' : 'text-slate-300'}`}>{pStats.pendientes}</p>
              <p className="text-[10px] font-bold text-slate-400">/ {pStats.total} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* CARDS DE GESTIÓN DE CONTENIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 group hover:border-green-500 transition-all duration-500 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div className="p-5 bg-green-50 text-green-600 rounded-3xl"><Inbox size={28} /></div>
            <span className="text-4xl font-black text-slate-200 group-hover:text-green-100">{data.clases.length}</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-slate-900 mb-2">Clases y Talleres</h3>
          <button onClick={() => setViewManager("clases")} className="w-full flex justify-between items-center bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all cursor-pointer">Administrar Clases <ChevronRight size={18} /></button>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 group hover:border-orange-500 transition-all duration-500 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div className="p-5 bg-orange-50 text-orange-600 rounded-3xl"><Newspaper size={28} /></div>
            <span className="text-4xl font-black text-slate-200 group-hover:text-orange-100">{data.noticias.length}</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-slate-900 mb-2">Novedades y Blog</h3>
          <button onClick={() => setViewManager("noticias")} className="w-full flex justify-between items-center bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all cursor-pointer">Administrar Noticias <ChevronRight size={18} /></button>
        </div>
      </div>

      {/* AJUSTES GLOBALES */}
      <div className="bg-slate-900 p-10 md:p-14 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-12">
          <div className="flex justify-between items-center border-b border-white/10 pb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 text-slate-900 rounded-2xl"><Settings2 size={24} /></div>
              <div><h2 className="text-3xl font-black uppercase tracking-tighter">Ajustes Globales</h2><p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Contacto y Redes</p></div>
            </div>
            <button onClick={saveGeneralSettings} disabled={loading} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-400 transition-all flex items-center gap-2 cursor-pointer"><Save size={18} /> {loading ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div className="space-y-5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Contacto</label>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><Mail className="text-slate-600" size={20} /><input type="email" placeholder="Email" value={data.general.email} onChange={(e)=>setData({...data, general: {...data.general, email: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><Phone className="text-slate-600" size={20} /><input type="text" placeholder="Teléfono" value={data.general.phone} onChange={(e)=>setData({...data, general: {...data.general, phone: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><MapPin className="text-slate-600" size={20} /><input type="text" placeholder="Dirección" value={data.general.address} onChange={(e)=>setData({...data, general: {...data.general, address: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
              </div>

              <div className="space-y-5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Redes Sociales</label>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><Instagram className="text-pink-500" size={20} /><input type="text" placeholder="Instagram URL" value={data.general.instagram} onChange={(e)=>setData({...data, general: {...data.general, instagram: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><Facebook className="text-blue-500" size={20} /><input type="text" placeholder="Facebook URL" value={data.general.facebook} onChange={(e)=>setData({...data, general: {...data.general, facebook: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><YoutubeIcon className="text-red-500" size={20} /><input type="text" placeholder="Youtube URL" value={data.general.youtube} onChange={(e)=>setData({...data, general: {...data.general, youtube: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
              </div>
            </div>

            <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center"><label className="text-[11px] font-black uppercase text-slate-500">Docentes</label><button onClick={() => setViewList("teachers")} className="text-[10px] font-black text-green-400 uppercase tracking-widest cursor-pointer">Gestionar</button></div>
                <div className="flex flex-wrap gap-2">{data.teachers.map((t, i) => <span key={i} className="px-4 py-2 bg-slate-800 rounded-xl text-[11px] font-bold">{t}</span>)}</div>
              </div>
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center"><label className="text-[11px] font-black uppercase text-slate-500">Instrumentos</label><button onClick={() => setViewList("instruments")} className="text-[10px] font-black text-green-400 uppercase tracking-widest cursor-pointer">Gestionar</button></div>
                <div className="flex flex-wrap gap-2">{data.instruments.map((ins, i) => <span key={i} className="px-4 py-2 bg-slate-800 rounded-xl text-[11px] font-bold">{ins}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LISTADO */}
      <AnimatePresence>
        {submissionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSubmissionModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white w-full max-w-5xl h-[95vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
              <header className="p-8 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tighter">{submissionModal.type}</h3>
                <button onClick={() => setSubmissionModal(null)} className="p-3 bg-slate-200 hover:bg-slate-900 hover:text-white rounded-full transition-all cursor-pointer"><X size={20} /></button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {submissionModal.items.length === 0 ? (
                  <div className="text-center py-20 text-slate-300 font-black uppercase text-xs tracking-widest">Sin registros.</div>
                ) : (
                  submissionModal.items.map((sub) => (
                    <div 
                      key={sub.id} 
                      className={`group p-6 rounded-2xl border-2 transition-all flex justify-between items-center cursor-pointer ${
                        sub.status === 'leído' 
                          ? 'bg-slate-50 border-transparent opacity-60' 
                          : 'bg-white border-slate-100 hover:border-slate-900 shadow-sm'
                      }`}
                    >
                      <div onClick={() => setSelectedSub(sub)} className="flex-1 flex gap-4 items-center">
                        <div className={`p-3 rounded-xl ${sub.status === 'leído' ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white'}`}><Mail size={16}/></div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase">{sub.fullname}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {sub.status !== 'leído' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteSubmission(sub.id); }}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                        <ChevronRight onClick={() => setSelectedSub(sub)} size={18} className="text-slate-300" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DETALLE */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedSub(null)} />
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-3xl overflow-hidden">
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${selectedSub.status === 'leído' ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}><MessageSquare /></div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => deleteSubmission(selectedSub.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                    >
                      <Trash2 size={20}/>
                    </button>
                    <button onClick={() => setSelectedSub(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all cursor-pointer"><X size={24}/></button>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Mensaje:</h4>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-700 text-sm leading-relaxed">
                    "{selectedSub.message || selectedSub.level_or_experience || selectedSub.instrument || 'Sin detalles.'}"
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-black uppercase text-slate-900"><Mail size={12} className="mb-2 text-slate-400"/> {selectedSub.email}</div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-black uppercase text-slate-900"><Phone size={12} className="mb-2 text-slate-400"/> {selectedSub.phone || 'N/A'}</div>
                </div>
                {selectedSub.status !== 'leído' && (
                  <button 
                    onClick={() => markAsRead(selectedSub.id)} 
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-xl cursor-pointer"
                  >
                    <CheckCircle size={16}/> Marcar como Gestionado
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPONENTES DE GESTIÓN DE ITEMS */}
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
          title={viewList === "teachers" ? "Base de Docentes" : "Lista de Instrumentos"}
          list={viewList === "teachers" ? data.teachers : data.instruments}
          onClose={() => setViewList(null)}
          onUpdate={async (newList) => {
            if (viewList === "teachers") await updateTeachersAdmin(newList);
            else await updateInstrumentsAdmin(newList);
            await refreshData();
          }}
        />
      )}
    </div>
  );
}
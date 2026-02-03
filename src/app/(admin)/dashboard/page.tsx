"use client";
import { useEffect, useState } from "react";
import { 
  getCollectionAdmin, getInstrumentsAdmin, getTeachersAdmin, 
  getGlobalSettingsAdmin, updateGlobalSettingsAdmin 
} from "@/services/admin-services";
import { Class, News } from "@/types";
import { 
  Plus, Music, Newspaper, Settings2, RefreshCw, 
  ChevronRight, Save, Mail, Phone, MapPin, Instagram, Facebook, 
  YoutubeIcon, Users, X, Clock, CheckCircle, MessageSquare
} from "lucide-react";
import CollectionManager from "../components/CollectionManager";
import ListManager from "../components/ListManager";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
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
    general: { email: "", phone: "", address: "", instagram: "", facebook: "", youtube: "" }
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
        general: gen.success ? gen.data : data.general
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "submissions", id), { status: 'leído' });
      setData(prev => ({
        ...prev,
        submissions: prev.submissions.map(s => s.id === id ? { ...s, status: 'leído' } : s)
      }));
      setSelectedSub(null);
    } catch (e) {
      alert("Error al actualizar");
    }
  };

  const saveGeneralSettings = async () => {
    setLoading(true);
    const res = await updateGlobalSettingsAdmin(data.general);
    if (res.success) alert("✓ Configuración global actualizada");
    setLoading(false);
  };

  const consultas = data.submissions.filter(s => s.type === 'contacto');
  const inscripciones = data.submissions.filter(s => s.type === 'inscripcion');
  const docentes = data.submissions.filter(s => s.role === 'docente');

  return (
    <div className="space-y-12 pb-32">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">General Dashboard</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Control total de la escuela</p>
        </div>
        <button onClick={refreshData} disabled={loading} className="p-4 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* BARRA DE COMUNICACIONES REAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => setSubmissionModal({ type: 'Consultas', items: consultas })} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-slate-900 transition-all cursor-pointer">
          <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-green-500 transition-colors"><Mail size={24} /></div>
          <div><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Consultas</h4><p className="text-xl font-black text-slate-900">{consultas.length} Mensajes</p></div>
        </div>
        <div onClick={() => setSubmissionModal({ type: 'Inscripciones', items: inscripciones })} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-slate-900 transition-all cursor-pointer">
          <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-blue-500 transition-colors"><Music size={24} /></div>
          <div><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inscripciones</h4><p className="text-xl font-black text-slate-900">{inscripciones.length} Pendientes</p></div>
        </div>
        <div onClick={() => setSubmissionModal({ type: 'Docentes', items: docentes })} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-slate-900 transition-all cursor-pointer">
          <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-orange-500 transition-colors"><Users size={24} /></div>
          <div><h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Docentes</h4><p className="text-xl font-black text-slate-900">{docentes.length} Postulados</p></div>
        </div>
      </div>

      {/* CARDS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm group hover:border-green-500 transition-all duration-500">
          <div className="flex justify-between items-start mb-8">
            <div className="p-5 bg-green-50 text-green-600 rounded-3xl group-hover:scale-110 transition-transform"><Music size={28} /></div>
            <span className="text-4xl font-black text-slate-200 group-hover:text-green-100">{data.clases.length}</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-slate-900 mb-2">Clases y Talleres</h3>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">Administra la oferta académica, horarios y docentes.</p>
          <button onClick={() => setViewManager("clases")} className="w-full flex justify-between items-center bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-600 transition-all shadow-xl">
            Administrar Clases <ChevronRight size={18} />
          </button>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm group hover:border-orange-500 transition-all duration-500">
          <div className="flex justify-between items-start mb-8">
            <div className="p-5 bg-orange-50 text-orange-600 rounded-3xl group-hover:scale-110 transition-transform"><Newspaper size={28} /></div>
            <span className="text-4xl font-black text-slate-200 group-hover:text-orange-100">{data.noticias.length}</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-slate-900 mb-2">Novedades y Blog</h3>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">Publica conciertos y noticias de la comunidad.</p>
          <button onClick={() => setViewManager("noticias")} className="w-full flex justify-between items-center bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl">
            Administrar Noticias <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* VENTANA EMERGENTE DE MENSAJES */}
      <AnimatePresence>
        {submissionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSubmissionModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
              <header className="p-8 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tighter">{submissionModal.type}</h3>
                <button onClick={() => setSubmissionModal(null)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X /></button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {submissionModal.items.length === 0 ? (
                  <div className="text-center py-20 text-slate-300 font-bold uppercase text-xs tracking-widest">No hay registros cargados</div>
                ) : (
                  submissionModal.items.map((sub) => (
                    <div key={sub.id} onClick={() => setSelectedSub(sub)} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${sub.status === 'leído' ? 'bg-slate-50 border-transparent grayscale' : 'bg-white border-slate-100 hover:border-slate-900 shadow-sm'}`}>
                      <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-xl ${sub.status === 'leído' ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white'}`}><Mail size={16}/></div>
                        <div><p className="text-sm font-black text-slate-900 uppercase">{sub.fullname}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.email}</p></div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DETALLE DE MENSAJE */}
      <AnimatePresence>
        {selectedSub && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setSelectedSub(null)} />
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-3xl overflow-hidden">
              <div className="p-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${selectedSub.status === 'leído' ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}><MessageSquare /></div>
                  <button onClick={() => setSelectedSub(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={20}/></button>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Mensaje / Comentario</h4>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-700 text-sm leading-relaxed">
                    "{selectedSub.message || selectedSub.level_or_experience || selectedSub.instrument || 'Sin comentario adicional.'}"
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-black uppercase text-slate-500"><Mail size={12} className="mb-2 text-slate-300"/> {selectedSub.email}</div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-black uppercase text-slate-500"><Phone size={12} className="mb-2 text-slate-300"/> {selectedSub.phone || 'N/A'}</div>
                </div>
                {selectedSub.status !== 'leído' && (
                  <button onClick={() => markAsRead(selectedSub.id)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-xl">
                    <CheckCircle size={16}/> Marcar como Leído
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ajustes Globales */}
      <div className="bg-slate-900 p-10 md:p-14 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-12">
          <div className="flex justify-between items-center border-b border-white/10 pb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 text-slate-900 rounded-2xl"><Settings2 size={24} /></div>
              <div><h2 className="text-3xl font-black uppercase tracking-tighter">Ajustes Globales</h2><p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Contacto y Listas Maestras</p></div>
            </div>
            <button onClick={saveGeneralSettings} disabled={loading} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-400 transition-all flex items-center gap-2"><Save size={18} /> {loading ? "Guardando..." : "Guardar"}</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="grid grid-cols-1 gap-5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Datos de Contacto</label>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><Mail className="text-slate-600" size={20} /><input type="email" value={data.general.email} onChange={(e)=>setData({...data, general: {...data.general, email: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><Phone className="text-slate-600" size={20} /><input type="text" value={data.general.phone} onChange={(e)=>setData({...data, general: {...data.general, phone: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10"><MapPin className="text-slate-600" size={20} /><input type="text" value={data.general.address} onChange={(e)=>setData({...data, general: {...data.general, address: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
              </div>
            </div>
            <div className="space-y-12 bg-white/5 p-10 rounded-[3rem] border border-white/10">
              <div className="space-y-6">
                <div className="flex justify-between items-center"><label className="text-[11px] font-black uppercase text-slate-500">Staff Docente</label><button onClick={() => setViewList("teachers")} className="text-[10px] font-black text-green-400 uppercase tracking-widest">Gestionar</button></div>
                <div className="flex flex-wrap gap-2">{data.teachers.map((t, i) => <span key={i} className="px-4 py-2 bg-slate-800 rounded-xl text-[11px] font-bold">{t}</span>)}</div>
              </div>
              <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex justify-between items-center"><label className="text-[11px] font-black uppercase text-slate-500">Instrumentos</label><button onClick={() => setViewList("instruments")} className="text-[10px] font-black text-green-400 uppercase tracking-widest">Gestionar</button></div>
                <div className="flex flex-wrap gap-2">{data.instruments.map((ins, i) => <span key={i} className="px-4 py-2 bg-slate-800 rounded-xl text-[11px] font-bold">{ins}</span>)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales de Gestión de Items */}
      {viewManager && (
        <CollectionManager 
          type={viewManager} items={viewManager === "clases" ? data.clases : data.noticias}
          teachers={data.teachers} instruments={data.instruments} onClose={() => setViewManager(null)}
          onUpsert={async (item) => { /* lógica upsert */ refreshData(); }}
          onDelete={async (id) => { /* lógica delete */ refreshData(); }}
        />
      )}
      {viewList && (
        <ListManager title={viewList === "teachers" ? "Base de Docentes" : "Instrumentos"}
          list={viewList === "teachers" ? data.teachers : data.instruments} onClose={() => setViewList(null)}
          onUpdate={async (newList) => { refreshData(); }}
        />
      )}
    </div>
  );
}
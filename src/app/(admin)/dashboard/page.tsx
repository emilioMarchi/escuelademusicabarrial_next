"use client";
import { useEffect, useState } from "react";
import { 
  getCollectionAdmin, upsertItemAdmin, deleteItemAdmin,
  getInstrumentsAdmin, updateInstrumentsAdmin,
  getTeachersAdmin, updateTeachersAdmin,
  getGlobalSettingsAdmin, updateGlobalSettingsAdmin,
  seedAllPagesProfessional 
} from "@/services/admin-services";
import { Class, News } from "@/types";
import { 
  Plus, Music, Newspaper, Settings2, RefreshCw, 
  ChevronRight, Save, Mail, Phone, MapPin, Instagram, Facebook, 
  YoutubeIcon
} from "lucide-react";
import CollectionManager from "../components/CollectionManager";
import ListManager from "../components/ListManager";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [viewManager, setViewManager] = useState<"clases" | "noticias" | null>(null);
  const [viewList, setViewList] = useState<"teachers" | "instruments" | null>(null);

  const [data, setData] = useState({
    clases: [] as Class[],
    noticias: [] as News[],
    instruments: [] as string[],
    teachers: [] as string[],
    general: { email: "", phone: "", address: "", instagram: "", facebook: "", youtube: "" }
  });

  const refreshData = async () => {
    setLoading(true);
    const [clases, noticias, inst, teach, gen] = await Promise.all([
      getCollectionAdmin("clases"),
      getCollectionAdmin("noticias"),
      getInstrumentsAdmin(),
      getTeachersAdmin(),
      getGlobalSettingsAdmin()
    ]);
    setData({
      clases: clases.success ? clases.data : [],
      noticias: noticias.success ? noticias.data : [],
      instruments: inst.success ? inst.data : [],
      teachers: teach.success ? teach.data : [],
      general: gen.success ? gen.data : data.general
    });
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  const saveGeneralSettings = async () => {
    setLoading(true);
    const res = await updateGlobalSettingsAdmin(data.general);
    if (res.success) alert("✓ Configuración global actualizada");
    setLoading(false);
  };

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

      {/* Cards Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm group hover:border-green-500 transition-all duration-500">
          <div className="flex justify-between items-start mb-8">
            <div className="p-5 bg-green-50 text-green-600 rounded-3xl group-hover:scale-110 transition-transform"><Music size={28} /></div>
            <span className="text-4xl font-black text-slate-200 group-hover:text-green-100">{data.clases.length}</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-slate-900 mb-2">Clases y Talleres</h3>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">Administra la oferta académica, horarios y asignación de docentes.</p>
          <button onClick={() => setViewManager("clases")} className="w-full flex justify-between items-center bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-600 transition-all shadow-xl shadow-slate-200">
            Administrar Clases <ChevronRight size={18} />
          </button>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm group hover:border-orange-500 transition-all duration-500">
          <div className="flex justify-between items-start mb-8">
            <div className="p-5 bg-orange-50 text-orange-600 rounded-3xl group-hover:scale-110 transition-transform"><Newspaper size={28} /></div>
            <span className="text-4xl font-black text-slate-200 group-hover:text-orange-100">{data.noticias.length}</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-slate-900 mb-2">Novedades y Blog</h3>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">Publica conciertos, noticias de la comunidad y actualizaciones barriales.</p>
          <button onClick={() => setViewManager("noticias")} className="w-full flex justify-between items-center bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl shadow-slate-200">
            Administrar Noticias <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Ajustes Globales */}
      <div className="bg-slate-900 p-10 md:p-14 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-12">
          <div className="flex justify-between items-center border-b border-white/10 pb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 text-slate-900 rounded-2xl"><Settings2 size={24} /></div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Ajustes de la Escuela</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configuración de contacto y redes</p>
              </div>
            </div>
            <button onClick={saveGeneralSettings} disabled={loading} className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-green-400 disabled:opacity-50 active:scale-95 shadow-2xl shadow-green-900/40">
              <Save size={18} /> {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-10">
              <div className="grid grid-cols-1 gap-5">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Información de Contacto</label>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 focus-within:border-green-500 transition-all"><Mail className="text-slate-600" size={20} /><input type="email" placeholder="Email institucional" value={data.general.email} onChange={(e)=>setData({...data, general: {...data.general, email: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 focus-within:border-green-500 transition-all"><Phone className="text-slate-600" size={20} /><input type="text" placeholder="Teléfono" value={data.general.phone} onChange={(e)=>setData({...data, general: {...data.general, phone: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
                <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 focus-within:border-green-500 transition-all"><MapPin className="text-slate-600" size={20} /><input type="text" placeholder="Dirección" value={data.general.address} onChange={(e)=>setData({...data, general: {...data.general, address: e.target.value}})} className="bg-transparent border-none outline-none text-sm w-full font-bold" /></div>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Presencia Digital</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 focus-within:border-pink-500 transition-all"><Instagram className="text-pink-500" size={20} /><input type="text" placeholder="Instagram URL" value={data.general.instagram} onChange={(e)=>setData({...data, general: {...data.general, instagram: e.target.value}})} className="bg-transparent border-none outline-none text-[10px] w-full" /></div>
                   <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 focus-within:border-blue-500 transition-all"><Facebook className="text-blue-500" size={20} /><input type="text" placeholder="Facebook URL" value={data.general.facebook} onChange={(e)=>setData({...data, general: {...data.general, facebook: e.target.value}})} className="bg-transparent border-none outline-none text-[10px] w-full" /></div>
                  <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 focus-within:border-blue-500 transition-all"><YoutubeIcon className="text-blue-500" size={20} /><input type="text" placeholder="Youtube URL" value={data.general.Youtube} onChange={(e)=>setData({...data, general: {...data.general, youtube: e.target.value}})} className="bg-transparent border-none outline-none text-[10px] w-full" /></div>

                </div>
              </div>
            </div>

            <div className="space-y-12 bg-white/5 p-10 rounded-[3rem] border border-white/10">
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Staff Docente</label>
                    <button onClick={() => setViewList("teachers")} className="text-[10px] font-black text-green-400 uppercase tracking-widest hover:text-green-300 transition-colors border-b border-green-400/20 pb-1">Gestionar Lista</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.teachers.map((t, i) => <span key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-bold tracking-tight">{t}</span>)}
                    {data.teachers.length === 0 && <span className="text-[11px] text-slate-600 italic">No hay docentes cargados</span>}
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-center border-t border-white/10 pt-8">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 ml-2">Instrumentos</label>
                    <button onClick={() => setViewList("instruments")} className="text-[10px] font-black text-green-400 uppercase tracking-widest hover:text-green-300 transition-colors border-b border-green-400/20 pb-1">Gestionar Lista</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.instruments.map((ins, i) => <span key={i} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-bold tracking-tight">{ins}</span>)}
                    {data.instruments.length === 0 && <span className="text-[11px] text-slate-600 italic">No hay instrumentos cargados</span>}
                  </div>
               </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
      </div>

      {/* Modales */}
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
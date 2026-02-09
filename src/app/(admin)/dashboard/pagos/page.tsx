"use client";
import { useEffect, useState } from "react";
import { getDonationsAdmin, deleteDonationAdmin } from "@/services/admin-services";
import { 
  DollarSign, Clock, Search, Copy, CheckCircle, 
  ExternalLink, Trash2, Download, 
  User, Hash, Activity, RefreshCcw, CreditCard, Users, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 1. Agregamos 'cancelled' a la interfaz
interface Donation {
  id: string;
  name: string;
  email: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'; 
  type: 'subscription' | 'one-time';
  mp_id?: string;
  mp_payment_id?: string;
  payment_link?: string;
  created_at: string;
}

export default function PagosDashboard() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getDonationsAdmin();
    if (res.success && 'data' in res) {
      setDonations(res.data as Donation[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const confirmDelete = async () => {
    if (!deletingId) return;
    const res = await deleteDonationAdmin(deletingId);
    if (res.success) {
      setDonations(prev => prev.filter(d => d.id !== deletingId));
      setDeletingId(null);
    }
  };

  const downloadCSV = () => {
    const headers = ["Fecha", "Hora", "Donante", "Email", "Tipo", "ID Operacion", "Monto", "Estado"];
    const rows = filteredDonations.map(d => {
      const dateObj = new Date(d.created_at);
      return [
        dateObj.toLocaleDateString('es-AR'),
        dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        `"${(d.name || "").replace(/"/g, '""')}"`,
        `"${d.email || ""}"`,
        d.type === 'subscription' ? 'Suscripcion' : 'Pago Unico',
        `"${d.mp_payment_id || d.mp_id || 'N/A'}"`,
        d.amount,
        d.status === 'cancelled' ? 'Cancelado' : d.status
      ].join(",");
    });
    const csvContent = "sep=,\n" + "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `auditoria_${new Date().getTime()}.csv`);
    link.click();
  };

  const approvedItems = donations.filter(d => d.status === 'approved');
  const pendingItems = donations.filter(d => d.status === 'pending');

  const uniqueDonorsTotal = new Set(donations.map(d => d.email?.toLowerCase()).filter(Boolean)).size;
  const uniqueDonorsUnicos = new Set(donations.filter(d => d.type !== 'subscription').map(d => d.email?.toLowerCase()).filter(Boolean)).size;
  const uniqueDonorsSuscrip = new Set(donations.filter(d => d.type === 'subscription').map(d => d.email?.toLowerCase()).filter(Boolean)).size;

  const stats = {
    totalAprobado: approvedItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    totalPendiente: pendingItems.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    unicosAprobadosMonto: approvedItems.filter(d => d.type !== 'subscription').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    suscripAprobadasMonto: approvedItems.filter(d => d.type === 'subscription').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
  };

  const filteredDonations = donations.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mp_id?.toString().includes(searchTerm) ||
    d.mp_payment_id?.toString().includes(searchTerm)
  );

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-300 animate-pulse">Sincronizando Auditoría...</div>;

  return (
    <div className="p-2 lg:p-4 w-full space-y-6 pb-32">
      
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={30} /></div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">¿Eliminar?</h3>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-xs rounded-2xl">No</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white font-black uppercase text-xs rounded-2xl hover:bg-red-600">Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
                <CreditCard size={14}/> <span className="text-[9px] font-black uppercase">Únicos</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">${stats.unicosAprobadosMonto.toLocaleString('es-AR')}</h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Donantes: {uniqueDonorsUnicos}</p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-purple-600">
                <RefreshCcw size={14}/> <span className="text-[9px] font-black uppercase">Suscrip.</span>
            </div>
            <h3 className="text-xl font-black text-slate-900">${stats.suscripAprobadasMonto.toLocaleString('es-AR')}</h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Usuarios: {uniqueDonorsSuscrip}</p>
        </div>

        <div className="bg-green-600 p-4 rounded-3xl text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14}/> <span className="text-[9px] font-black uppercase opacity-80">Total</span>
            </div>
            <h3 className="text-xl font-black">${stats.totalAprobado.toLocaleString('es-AR')}</h3>
            <p className="text-[8px] font-bold uppercase mt-1 opacity-80">Donantes: {uniqueDonorsTotal}</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-orange-400">
                <Clock size={14}/> <span className="text-[9px] font-black uppercase">Pendiente</span>
            </div>
            <h3 className="text-xl font-black">${stats.totalPendiente.toLocaleString('es-AR')}</h3>
            <p className="text-[8px] font-bold uppercase mt-1 text-orange-400">{pendingItems.length} Operaciones</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="relative w-full max-w-3xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-black outline-none focus:ring-2 ring-slate-900/5 transition-all"
          />
        </div>
        <button 
          onClick={downloadCSV}
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-md"
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200">
                <th className="px-3 py-4">Donante</th>
                <th className="px-3 py-4">Comprobante</th>
                <th className="px-3 py-4 text-center">Fecha/Hora</th>
                <th className="px-3 py-4 text-right">Monto</th>
                <th className="px-3 py-4 text-center">Estado</th>
                <th className="px-3 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.map((doc) => (
                <tr key={doc.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-3 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 uppercase text-[10px] truncate max-w-[120px]">{doc.name}</span>
                      <span className="text-[9px] text-slate-400 font-bold truncate max-w-[120px]">{doc.email}</span>
                      <span className={`mt-1 w-fit text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${
                          doc.type === 'subscription' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {doc.type === 'subscription' ? 'Suscrip.' : 'Único'}
                        </span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center gap-1 group/copy">
                      <span className="text-[9px] font-black text-slate-600 bg-slate-100 px-1.5 py-1 rounded border border-slate-200 font-mono">
                        {doc.mp_payment_id || doc.mp_id || 'N/A'}
                      </span>
                      <button onClick={() => { navigator.clipboard.writeText(doc.mp_payment_id || doc.mp_id || ""); alert("Copiado"); }} className="p-1 bg-white border border-slate-200 rounded hover:border-slate-900 transition-all">
                        <Copy size={8} className="text-slate-400" />
                      </button>
                    </div>
                  </td>

                  <td className="px-3 py-4 text-center">
                    <div className="flex flex-col text-[9px] font-bold">
                        <span className="text-slate-800">{new Date(doc.created_at).toLocaleDateString('es-AR')}</span>
                        <span className="text-slate-400">{new Date(doc.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}hs</span>
                    </div>
                  </td>

                  <td className="px-3 py-4 text-right">
                    <span className="text-xs font-black text-slate-900 tabular-nums">
                      ${Number(doc.amount).toLocaleString('es-AR')}
                    </span>
                  </td>

                  <td className="px-3 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                        {/* 2. Lógica de Badge para Cancelado */}
                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase border ${
                          doc.status === 'approved' ? 'bg-green-50 border-green-200 text-green-700' : 
                          doc.status === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                          doc.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        {doc.status === 'approved' ? 'Aprobado' : 
                         doc.status === 'pending' ? 'Pendiente' : 
                         doc.status === 'cancelled' ? 'Cancelado' : 'Rechazado'}
                        </span>
                        
                        {doc.payment_link && doc.status === 'pending' && (
                        <a href={doc.payment_link} target="_blank" className="flex items-center gap-1 text-[7px] font-black uppercase text-blue-500 hover:text-blue-700">
                            Pagar <ExternalLink size={7} />
                        </a>
                        )}
                    </div>
                  </td>

                  <td className="px-3 py-4 text-right">
                    <button onClick={() => setDeletingId(doc.id)} className="p-2 text-slate-200 hover:text-red-600 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
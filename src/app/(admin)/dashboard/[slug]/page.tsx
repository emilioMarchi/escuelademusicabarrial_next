"use client";
import { useEffect, useState } from "react";
import { getDonationsAdmin } from "@/services/admin-services";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  ReceiptText, 
  Users,
  ArrowUpRight,
  Target,
  Heart,
  CalendarDays
} from "lucide-react";
import { motion } from "framer-motion";

export default function PagosDashboard() {
  const [donations, setDonations] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({ available_balance: 0, unavailable_balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // 1. Cargamos donaciones guardadas en Firebase
      const res = await getDonationsAdmin();
      if (res.success) {
        setDonations(res.data);
      }
      
      // 2. Cargamos el balance real de la API de Mercado Pago
      try {
        const balanceRes = await fetch("/api/admin/mp-balance");
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance(balanceData);
        }
      } catch (e) {
        console.error("Error cargando balance de MP:", e);
      }
      
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-slate-400 animate-pulse">Sincronizando Finanzas...</p>
      </div>
    );
  }

  // --- CÁLCULO DE MÉTRICAS AVANZADAS ---
  const approved = donations.filter(d => d.status === 'approved');
  
  // Total Histórico Aprobado
  const totalBruto = approved.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  
  // Desglose por tipo de aporte
  const totalSuscripciones = approved
    .filter(d => d.type === 'subscription')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
  const totalDonacionesUnicas = approved
    .filter(d => d.type !== 'subscription')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Conteo de socios únicos (por email)
  const sociosActivos = new Set(
    approved.filter(d => d.type === 'subscription').map(d => d.email)
  ).size;

  // Ticket promedio
  const ticketPromedio = approved.length > 0 ? totalBruto / approved.length : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      
      {/* HEADER PROFESIONAL */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">Cuentas y Aportes</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Estado de cuenta en tiempo real • Mercado Pago
          </p>
        </div>
        <div className="bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] flex items-center gap-4 shadow-2xl border border-white/10">
          <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-500">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Ingresos Totales (Bruto)</p>
            <p className="text-2xl font-black tracking-tighter">${totalBruto.toLocaleString('es-AR')}</p>
          </div>
        </div>
      </header>

      {/* BLOQUE DE BALANCE MERCADO PAGO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Principal: Dinero Disponible */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group"
        >
          <DollarSign className="absolute -right-6 -bottom-6 size-48 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-orange-500 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full">Disponible</span>
            </div>
            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.2em] mb-2">Saldo listo para retirar</p>
            <h2 className="text-6xl font-black tracking-tighter mb-8">${balance.available_balance.toLocaleString('es-AR')}</h2>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
              <ArrowUpRight size={18} className="text-green-400" />
              <span>Actualizado hace unos instantes</span>
            </div>
          </div>
        </motion.div>

        {/* Card Secundaria: Dinero a liberar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fondos en proceso</p>
              <h2 className="text-4xl font-black text-slate-900">${balance.unavailable_balance.toLocaleString('es-AR')}</h2>
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
            Este dinero está retenido por plazos de acreditación de Mercado Pago. Se liberará automáticamente.
          </p>
        </motion.div>
      </div>

      {/* GRID DE MÉTRICAS DE GESTIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Suscripciones", val: totalSuscripciones, icon: Users, color: "blue" },
          { label: "Aportes Únicos", val: totalDonacionesUnicas, icon: Heart, color: "pink" },
          { label: "Socios Activos", val: sociosActivos, icon: CalendarDays, color: "green", noSymbol: true },
          { label: "Ticket Promedio", val: ticketPromedio, icon: TrendingUp, color: "purple" }
        ].map((item, i) => (
          <motion.div 
            key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (i * 0.1) }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-5 group hover:border-slate-900 transition-all cursor-default"
          >
            <div className={`p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all`}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.label}</p>
              <p className="text-xl font-black text-slate-900">
                {item.noSymbol ? item.val : `$${Math.round(item.val).toLocaleString('es-AR')}`}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* TABLA DE AUDITORÍA DE MOVIMIENTOS */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
              <ReceiptText size={24} />
            </div>
            <div>
              <h3 className="font-black uppercase text-sm tracking-widest text-slate-900">Historial de Transacciones</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronizado con Firebase Cloud</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
              {approved.length} Cobros Aprobados
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="px-10 py-6">Donante / Perfil</th>
                <th className="px-10 py-6">Modalidad</th>
                <th className="px-10 py-6">Monto Bruto</th>
                <th className="px-10 py-6">Estado Operación</th>
                <th className="px-10 py-6 text-right">Fecha / Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <p className="font-black uppercase text-slate-300 tracking-[0.3em] text-xs">No hay movimientos registrados</p>
                  </td>
                </tr>
              ) : (
                donations.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 font-black text-sm flex items-center justify-center uppercase group-hover:bg-orange-500 group-hover:text-white transition-all">
                          {doc.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 uppercase text-xs tracking-tight">{doc.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{doc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-1">
                        <div className={`text-[10px] font-black uppercase tracking-widest ${doc.type === 'subscription' ? 'text-blue-600' : 'text-slate-500'}`}>
                          {doc.type === 'subscription' ? 'Suscripción Mensual' : 'Aporte Voluntario'}
                        </div>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Pasarela: Mercado Pago</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="text-base font-black text-slate-900">
                        ${Number(doc.amount).toLocaleString('es-AR')}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-colors ${
                        doc.status === 'approved' 
                          ? 'bg-green-50 border-green-100 text-green-600' 
                          : doc.status === 'pending' 
                          ? 'bg-orange-50 border-orange-100 text-orange-600' 
                          : 'bg-red-50 border-red-100 text-red-500'
                      }`}>
                        {doc.status === 'approved' ? 'Acreditado' : doc.status === 'pending' ? 'Pendiente' : 'Fallido'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right font-medium">
                      <div className="text-xs font-black text-slate-900 uppercase tracking-tighter">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                        {doc.created_at ? new Date(doc.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''} hs
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
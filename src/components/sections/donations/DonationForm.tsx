"use client";
import React, { useState } from "react";
import { Loader2, CreditCard, Calendar, Guitar, ShieldCheck, Info, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Props {
  title?: string;
  description?: string;
  initialAmount?: number;
}

export default function DonationForm({ title, description, initialAmount }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [type, setType] = useState<"payment" | "subscription">("payment");
  
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    amount: initialAmount || 1000 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/payments", { ...formData, type });
      if (data.init_point) {
        window.open(data.init_point, '_blank', 'noopener,noreferrer');
        setIsSubmitted(true);
      } else { throw new Error(); }
    } catch (err) {
      setError("Error de conexión. Reintenta en unos instantes.");
    } finally { setLoading(false); }
  };

  if (isSubmitted) {
    return (
        <section className="py-20 px-6 flex items-center justify-center bg-slate-50 min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(34,197,94,0.08),transparent_50%)]" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="max-w-md w-full mx-auto bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 text-center border border-white relative z-10"
            >
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
                    <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-3 text-slate-900">¡Pestaña de pago abierta!</h2>
                <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                  Completá la operación en la ventana de Mercado Pago para confirmar tu apoyo.
                </p>
                <button onClick={() => setIsSubmitted(false)} className="px-8 py-4 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-green-600 transition-all shadow-lg active:scale-95">
                  Volver al formulario
                </button>
            </motion.div>
        </section>
    );
  }

  return (
    <section className="relative py-20 px-6 overflow-hidden bg-slate-50">
      {/* --- MESH GRADIENT BACKGROUND (Más sutil) --- */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-100/40 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1.1, 1, 1.1], x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-[100px]" 
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* COLUMNA INFO */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
              <Sparkles size={12} className="text-orange-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Haz que la música suene</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.9] text-slate-900">
              Tu ayuda <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">es el motor</span>
            </h2>
            
            <p className="font-serif italic text-lg text-slate-600 leading-relaxed max-w-sm">
              {description || "Acompañanos a seguir construyendo este espacio de formación y contención a través del arte."}
            </p>

            <div className="flex flex-col gap-4 max-w-[280px] mx-auto lg:mx-0 pt-4">
               <div className="grid grid-cols-2 gap-3">
                  {['payment', 'subscription'].map((btnType) => {
                      const isActive = type === btnType;
                      return (
                          <button key={btnType} type="button" onClick={() => setType(btnType as any)} 
                              className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300
                              ${isActive 
                                  ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200' 
                                  : 'border-white bg-white/60 text-slate-400 hover:border-slate-200 hover:text-slate-600 shadow-sm'}`}>
                              {btnType === 'payment' ? <CreditCard size={18} /> : <Calendar size={18} />}
                              <span className="text-[8px] font-black uppercase tracking-widest">{btnType === 'payment' ? 'Único' : 'Mensual'}</span>
                          </button>
                      )
                  })}
               </div>
            </div>
          </div>

          {/* COLUMNA FORMULARIO (GLASS CARD REFINADO) */}
          <div className="lg:col-span-7">
            <motion.div 
              layout
              className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)]"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   {['name', 'email'].map((field) => (
                      <div key={field} className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-4">
                            {field === 'name' ? 'Tu Nombre' : 'Tu Email'}
                          </label>
                          <input 
                              type={field === 'email' ? 'email' : 'text'} 
                              placeholder={field === 'name' ? "Juan Pérez" : "hola@tuemail.com"} required
                              className="w-full p-4 rounded-xl border-2 border-white bg-white/50 focus:bg-white focus:border-blue-500 text-slate-900 text-sm font-bold outline-none transition-all shadow-sm"
                              onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                          />
                      </div>
                   ))}
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-900 ml-4">Monto del aporte</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 group-focus-within:text-blue-500 transition-colors">$</div>
                    <input 
                        type="number" placeholder="0" required min="100"
                        className="w-full p-6 pl-12 rounded-[2rem] border-2 border-white bg-white/80 focus:border-green-500 text-slate-900 text-3xl font-black outline-none transition-all shadow-inner"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={type} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-green-50/50 border border-white"
                  >
                    <Info size={16} className="text-blue-600 shrink-0" />
                    <p className="text-[9px] font-bold leading-tight uppercase tracking-widest text-slate-600">
                      {type === "payment" ? "Aporte único mediante Mercado Pago." : "Suscripción mensual. Podés cancelarla cuando quieras."}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-2 space-y-4">
                   <button 
                     type="submit" disabled={loading}
                     className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-xl hover:bg-green-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                   >
                     {loading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                          Confirmar Donación <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                     )}
                   </button>

                   <div className="flex items-center justify-center gap-4 opacity-40">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Pago Encriptado</span>
                      </div>
                      <div className="h-3 w-[1px] bg-slate-200" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Mercado Pago</span>
                   </div>
                </div>
              </form>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
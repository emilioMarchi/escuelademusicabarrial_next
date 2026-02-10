"use client";
import React, { useState } from "react";
import { Loader2, CreditCard, Calendar, ShieldCheck, Info, CheckCircle2, ArrowRight, Sparkles, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Props {
  title?: string;
  description?: string;
  initialAmount?: number;
  backgroundImage?: string; // Corregido: Prop añadida para evitar el error de tipos
}

export default function DonationForm({ title, description, initialAmount, backgroundImage }: Props) {
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
    <section className="relative py-24 px-6 overflow-hidden bg-slate-950 min-h-[80vh] flex items-center">
      
      {/* --- BACKGROUND LOGIC --- */}
      <div className="absolute inset-0 z-0">
        {backgroundImage ? (
          <>
            <img 
              src={backgroundImage} 
              className="w-full h-full object-cover opacity-40" 
              alt="Background" 
            />
            {/* Overlay gradiente para asegurar contraste del texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </>
        ) : (
          /* Fallback mesh gradient si no hay imagen */
          <div className="absolute inset-0 bg-slate-900">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(59,130,246,0.15),transparent_50%)]" 
            />
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* COLUMNA INFO */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10"
            >
              <Sparkles size={12} className="text-orange-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">Haz que la música suene</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-white">
              {title || "Tu ayuda"} <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">es el motor</span>
            </h2>
            
            <p className="font-serif italic text-xl text-white/70 leading-relaxed max-w-sm mx-auto lg:mx-0">
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
                                  ? 'border-blue-500 bg-blue-500 text-white shadow-xl shadow-blue-900/20' 
                                  : 'border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
                              {btnType === 'payment' ? <CreditCard size={18} /> : <Calendar size={18} />}
                              <span className="text-[8px] font-black uppercase tracking-widest">{btnType === 'payment' ? 'Único' : 'Mensual'}</span>
                          </button>
                      )
                  })}
               </div>
            </div>
          </div>

          {/* COLUMNA FORMULARIO */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   {['name', 'email'].map((field) => (
                      <div key={field} className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">
                            {field === 'name' ? 'Tu Nombre' : 'Tu Email'}
                          </label>
                          <input 
                              type={field === 'email' ? 'email' : 'text'} 
                              placeholder={field === 'name' ? "Juan Pérez" : "hola@tuemail.com"} required
                              className="w-full p-4 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-500 text-slate-900 text-sm font-bold outline-none transition-all"
                              onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                          />
                      </div>
                   ))}
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Monto del aporte</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 group-focus-within:text-blue-500 transition-colors">$</div>
                    <input 
                        type="number" placeholder="0" required min="100"
                        className="w-full p-6 pl-12 rounded-[2rem] border-2 border-slate-50 bg-slate-50 focus:border-green-500 text-slate-900 text-4xl font-black outline-none transition-all shadow-inner"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={type} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100"
                  >
                    <Info size={16} className="text-blue-600 shrink-0" />
                    <p className="text-[9px] font-bold leading-tight uppercase tracking-widest text-blue-900/60">
                      {type === "payment" ? "Aporte único mediante Mercado Pago." : "Suscripción mensual. Podés cancelarla cuando quieras."}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="pt-2 space-y-4">
                    <button 
                      type="submit" disabled={loading}
                      className="w-full py-6 rounded-[2rem] bg-slate-900 text-white font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-xl hover:bg-green-600 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                          Confirmar Donación <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-4 opacity-40">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-green-600" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Pago Seguro</span>
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
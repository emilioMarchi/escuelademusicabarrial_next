// src/components/sections/donations/DonationForm.tsx
"use client";
import React, { useState } from "react";
import { Loader2, CreditCard, Calendar, ShieldCheck, Info, CheckCircle2, ArrowRight, Sparkles, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Props {
  title?: string;
  description?: string;
  initialAmount?: number;
  backgroundImage?: string;
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
        <section className="py-24 px-6 flex items-center justify-center bg-[#fdfbf7] min-h-[700px] relative overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="max-w-md w-full mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-orange-100 text-center border border-orange-50 relative z-10"
            >
                <div className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-200">
                    <Heart size={40} fill="currentColor" />
                </div>
                <h2 className="font-serif italic text-4xl mb-4 text-slate-900">¡Muchas gracias!</h2>
                <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">
                  Tu generosidad nos ayuda a que más chicos sigan transformando su realidad a través de la música.
                </p>
                <button onClick={() => setIsSubmitted(false)} className="w-full py-5 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-orange-600 transition-all active:scale-95">
                  Realizar otro aporte
                </button>
            </motion.div>
        </section>
    );
  }

  return (
    <section className="relative py-32 px-6 overflow-hidden bg-slate-950 flex items-center justify-center min-h-screen">
      
      {/* --- BACKGROUND AMBIENTAL --- */}
      <div className="absolute inset-0 z-0">
        {backgroundImage && (
          <div className="relative w-full h-full">
            <img 
              src={backgroundImage} 
              className="w-full h-full object-cover scale-110 blur-xl opacity-30" 
              alt="Background Ambient" 
            />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/60 to-slate-950" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
          </div>
        )}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* COLUMNA INFO */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-orange-500 rounded-full"
            >
              <Sparkles size={14} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Proyecto Colectivo</span>
            </motion.div>
            
            <div className="space-y-4">
                <h2 className="font-serif italic text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[0.9] text-white">
                  {title ? title : (
                    <>
                      Sumate a nuestro <br/>
                      <span className="text-orange-400">proyecto.</span>
                    </>
                  )}
                </h2>
                <div className="h-1 w-20 bg-orange-500/30 rounded-full mx-auto lg:mx-0"></div>
            </div>
            
            <p className="text-base md:text-lg font-medium text-white/60 max-w-sm mx-auto lg:mx-0 leading-relaxed">
              {description || "Tu aporte es fundamental para mantener los instrumentos y el equipo docente que hace posible la Escuela."}
            </p>

            <div className="flex justify-center lg:justify-start pt-4">
                <div className="inline-flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    {[
                      { id: 'payment', label: 'Aporte Único', icon: CreditCard },
                      { id: 'subscription', label: 'Mensual', icon: Calendar }
                    ].map((btn) => (
                        <button 
                          key={btn.id}
                          onClick={() => setType(btn.id as any)}
                          className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${type === btn.id 
                                ? 'bg-white text-slate-950 shadow-lg' 
                                : 'text-white/40 hover:text-white'}`}
                        >
                            <btn.icon size={14} />
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          {/* COLUMNA FORMULARIO */}
          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-10 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative bg-white/10 backdrop-blur-3xl p-8 md:p-14 rounded-[3.5rem] border border-white/10 shadow-2xl"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {['name', 'email'].map((field) => (
                      <div key={field} className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">
                            {field === 'name' ? 'Nombre Completo' : 'Correo Electrónico'}
                          </label>
                          <input 
                              type={field === 'email' ? 'email' : 'text'} 
                              required
                              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-bold outline-none focus:border-orange-500 focus:bg-white/10 transition-all placeholder:text-white/10"
                              onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                          />
                      </div>
                   ))}
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Monto a donar</label>
                  <div className="relative group">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-serif italic text-orange-500">$</span>
                    <input 
                        type="number" required min="100"
                        className="w-full p-8 pl-16 rounded-[2.5rem] bg-white/5 border border-white/10 text-white text-5xl font-black outline-none focus:border-orange-500 transition-all shadow-inner"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                    <button 
                      type="submit" disabled={loading}
                      className="w-full py-6 rounded-3xl bg-orange-500 text-white font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-xl shadow-orange-950/20 hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>Confirmar y Pagar <ArrowRight size={18} /></>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-white/30">
                            <ShieldCheck size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Pago Encriptado</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/30">
                            Mercado Pago
                        </div>
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
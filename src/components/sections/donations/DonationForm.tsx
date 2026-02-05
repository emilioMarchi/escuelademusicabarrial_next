"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Loader2, CreditCard, Calendar, Guitar, ShieldCheck, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface Props {
  title?: string;
  description?: string;
  backgroundImage?: string;
  initialAmount?: number;
}

export default function DonationForm({ title, description, backgroundImage, initialAmount }: Props) {
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
        <section className="py-20 px-6 flex items-center justify-center">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl w-full mx-auto bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-green-100 relative z-10">
                <CheckCircle2 size={50} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-slate-900">¡Pestaña de pago abierta!</h2>
                <p className="text-slate-500 font-medium text-sm mb-8">Completá la operación en la ventana de Mercado Pago.</p>
                <button onClick={() => setIsSubmitted(false)} className="px-6 py-3 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-colors">Volver a intentar</button>
            </motion.div>
            {backgroundImage && (
                 <div className="absolute inset-0 z-0 overflow-hidden">
                     <Image src={backgroundImage} alt="Fondo" fill className="object-cover blur opacity-30 scale-110" />
                     <div className="absolute inset-0 bg-white/80" />
                 </div>
            )}
        </section>
    );
  }

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {backgroundImage ? (
        <>
          <div className="absolute inset-0 z-0">
            <Image 
                src={backgroundImage} 
                alt="Fondo donaciones" 
                fill 
                className="object-cover"
                
            />
          </div>
          <div className="absolute inset-0 z-0 bg-slate-900/80 " />
        </>
      ) : (
         <div className="absolute inset-0 z-0 bg-slate-50" />
      )}

      <div className={`relative z-10 max-w-5xl mx-auto p-8 md:p-12 rounded-[3.5rem] shadow-2xl border transition-colors duration-300
         ${backgroundImage ? 'bg-slate-900/60 border-white/10 text-white shadow-black/30' : 'bg-white border-slate-100 text-slate-900 shadow-slate-200'}`}>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-inner transition-colors duration-300 ${backgroundImage ? 'bg-white/10 text-white' : 'bg-blue-50 text-[#009EE3]'}`}>
                <Guitar size={32} />
              </motion.div>
              
              <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4 transition-colors duration-300 ${backgroundImage ? 'text-white' : 'text-slate-900'}`}>
                {title || "Colabora con la Escuela"}
              </h2>
              <p className={`font-medium leading-relaxed text-sm mb-8 transition-colors duration-300 ${backgroundImage ? 'text-slate-300' : 'text-slate-500'}`}>
                {description || "Donaciones únicas o suscripciones mensuales para apoyar nuestro proyecto."}
              </p>

              <div className="flex gap-3 mb-6">
                {['payment', 'subscription'].map((btnType) => {
                    const isActive = type === btnType;
                    const activeStyle = backgroundImage 
                        ? 'border-white bg-white text-slate-900' 
                        : 'border-[#009EE3] bg-blue-50 text-[#009EE3]';
                    const inactiveStyle = backgroundImage
                        ? 'border-white/20 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600';

                    return (
                        <button key={btnType} type="button" onClick={() => setType(btnType as any)} 
                            className={`flex-1 p-4 rounded-[2rem] border-2 flex flex-col items-center gap-2 transition-all group ${isActive ? activeStyle : inactiveStyle}`}>
                            {btnType === 'payment' ? <CreditCard size={20} className="transition-transform group-hover:scale-110"/> : <Calendar size={20} className="transition-transform group-hover:scale-110"/>}
                            <span className="text-[9px] font-black uppercase tracking-widest">{btnType === 'payment' ? 'Aporte Único' : 'Suscripción'}</span>
                        </button>
                    )
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-start gap-3 p-5 rounded-2xl border transition-colors duration-300 ${backgroundImage ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                  {/* FIX APLICADO AQUÍ EN LÍNEA 132 */}
                  <Info size={16} className={`${backgroundImage ? "text-white" : "text-[#009EE3]"} shrink-0`} />
                  <p className={`text-[10px] font-bold leading-relaxed uppercase tracking-widest text-left ${backgroundImage ? "text-slate-300" : "text-slate-500"}`}>
                    {type === "payment" ? "Pago por única vez. Sin cargos futuros." : "Suscripción mensual. Cancelable cuando quieras."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className={`p-6 md:p-8 rounded-[3rem] space-y-4 border shadow-inner transition-colors duration-300 ${backgroundImage ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                {['name', 'email'].map((field) => (
                    <input key={field}
                        type={field === 'email' ? 'email' : 'text'} 
                        placeholder={field === 'name' ? "Nombre completo" : "email@ejemplo.com"} required
                        className={`w-full p-5 rounded-2xl border-2 outline-none text-sm font-bold transition-all
                            ${backgroundImage 
                                ? 'bg-white/10 border-transparent focus:border-white text-white placeholder:text-slate-500' 
                                : 'bg-white border-transparent focus:border-[#009EE3] text-slate-900 placeholder:text-slate-400'}`}
                        onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    />
                ))}
                
                <div className="relative">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-black transition-colors ${backgroundImage ? 'text-slate-400' : 'text-slate-400'}`}>$</span>
                  <input 
                    type="number" placeholder="Monto" required min="0"
                    className={`w-full p-5 pl-12 rounded-2xl border-2 outline-none text-sm font-black transition-all
                        ${backgroundImage 
                            ? 'bg-white/10 border-transparent focus:border-white text-white placeholder:text-slate-500' 
                            : 'bg-white border-transparent focus:border-[#009EE3] text-slate-900 placeholder:text-slate-400'}`}
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 text-[10px] font-black uppercase">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-3 pt-2">
                 <div className={`flex items-center justify-center gap-2 transition-colors ${backgroundImage ? 'text-white/60' : 'text-[#009EE3]/60'}`}>
                   <ShieldCheck size={14} className="text-green-500" />
                   <p className="text-[9px] font-black uppercase tracking-widest">Procesado por Mercado Pago</p>
                 </div>

                 <button 
                   type="submit" disabled={loading}
                   className={`w-full py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3
                    ${backgroundImage 
                        ? 'bg-white text-slate-900 hover:bg-slate-200 shadow-white/10' 
                        : 'bg-[#009EE3] text-white hover:bg-[#0087c1] shadow-blue-100'}`}
                 >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : "Ir a Pagar"}
                 </button>

                 <p className={`text-center text-[8px] font-bold uppercase tracking-widest leading-none transition-colors ${backgroundImage ? 'text-slate-400' : 'text-slate-400'}`}>
                   Se abrirá una nueva ventana segura
                 </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
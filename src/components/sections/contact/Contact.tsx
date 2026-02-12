// src/components/sections/contact/Contact.tsx
'use client'
import DynamicForm from "./DynamicForm";
import { Mail, SendHorizontal, Music, Sparkles } from "lucide-react";

interface Props {
  category: string;
  hasForm: boolean;
  customTitle?: string;
  customDescription?: string;
  anchorId?: string;
}

export default function Contact({ category, hasForm, customTitle, customDescription, anchorId }: Props) {
  
  const defaultContent = {
    contacto: {
      title: "Escribinos tus dudas",
      subtitle: "Estamos para escucharte y ayudarte a empezar tu camino musical.",
    },
    clases: {
      title: "¡Inscribite ahora!",
      subtitle: "Completá tus datos para reservar tu lugar en la Escuela.",
    },
    default: {
      title: "Sumate al proyecto",
      subtitle: "Dejanos tus datos para coordinar y conocernos.",
    }
  };

  const fallback = defaultContent[category as keyof typeof defaultContent] || defaultContent.default;
  const title = customTitle || fallback.title;
  const description = customDescription || fallback.subtitle;

  return (
    <section 
      id={anchorId} 
      className="py-24 bg-[#fdfbf7] relative overflow-hidden border-t border-slate-100"
    >
      {/* CAPA DE FONDO: Iconos como marcas de agua sutiles (z-0 y pointer-events-none) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Nota musical movida al extremo inferior derecho para que NO toque el texto */}
      <div className="absolute -bottom-10 right-10 text-slate-200/50 pointer-events-none -rotate-12 hidden lg:block">
         <Music size={160} strokeWidth={1} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          {/* Lado A: Texto Informativo */}
          <div className="text-center md:text-left">
            
            {/* Detalle decorativo superior: Fuera del área del título */}
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-white rounded-full border border-orange-100 shadow-sm">
               <Sparkles size={14} className="text-orange-400" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Canal de Consultas</span>
            </div>

            <h2 className="font-serif italic text-3xl md:text-5xl tracking-tight leading-[1.1] mb-6 text-slate-900">
              {title}
            </h2>

            {/* Separador con icono de carta: Integrado de forma que NO tapa nada */}
            <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
               <div className="h-[1px] w-8 bg-orange-200"></div>
               <SendHorizontal size={18} className="text-orange-400 -rotate-12" />
               <div className="h-[1px] w-24 bg-orange-200"></div>
            </div>

            <p className="text-sm md:text-base font-medium text-slate-500 max-w-sm leading-relaxed mx-auto md:mx-0">
              {description}
            </p>
          </div>

          {/* Lado B: El Formulario */}
          <div className="relative">
            {/* Efecto visual detrás del form */}
            <div className="absolute -inset-2 bg-gradient-to-br from-orange-50 to-transparent rounded-[3.5rem] blur-2xl opacity-50"></div>
            
            <div className="relative bg-white p-8 md:p-12 rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] border border-slate-100 text-slate-900">
              {hasForm ? (
                <DynamicForm type={category} />
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Mail size={24} className="opacity-20" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mensajería cerrada</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
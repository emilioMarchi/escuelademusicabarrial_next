// src/components/sections/contact/Contact.tsx
'use client'
import DynamicForm from "./DynamicForm";

interface Props {
  category: string;
  hasForm: boolean;
  // Agregamos props opcionales para recibir la data del DB
  customTitle?: string;
  customDescription?: string;
}

export default function Contact({ category, hasForm, customTitle, customDescription }: Props) {
  
  // Contenido por defecto (Fallback)
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

  // Priorizamos la data que viene del CMS (SectionData)
  const title = customTitle || fallback.title;
  const description = customDescription || fallback.subtitle;

  return (
    <section className="py-24 bg-orange-500 text-white relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          {/* Lado A: Texto Informativo (Dinámico) */}
          <div className="text-center md:text-left">
            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-none tracking-tighter">
              {title}
            </h2>
            <p className="text-xl font-medium opacity-90 leading-relaxed text-orange-50">
              {description}
            </p>
          </div>

          {/* Lado B: El Formulario Dinámico */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-orange-900/20 text-slate-900">
            {hasForm ? (
              <DynamicForm type={category} />
            ) : (
              <p className="text-center text-slate-400">Formulario deshabilitado.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
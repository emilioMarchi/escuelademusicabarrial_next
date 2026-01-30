// src/components/sections/contact/Contact.tsx
'use client'
import DynamicForm from "./DynamicForm";

interface Props {
  category: string;
  hasForm: boolean;
}

export default function Contact({ category, hasForm }: Props) {
  // Definimos los textos según la categoría
  const content = {
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

  const currentContent = content[category as keyof typeof content] || content.default;

  return (
    <section className="py-24 bg-orange-500 text-white relative overflow-hidden">
      {/* Decoración Multi-color sutil */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/20 rounded-full blur-[100px] -mr-48 -mt-48"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          {/* Lado A: Texto Informativo */}
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black mb-6 leading-tight tracking-tighter">
              {currentContent.title}
            </h2>
            <p className="text-xl font-medium opacity-90 leading-relaxed">
              {currentContent.subtitle}
            </p>
          </div>

          {/* Lado B: El Formulario Dinámico */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl text-slate-900">
            {hasForm ? (
              <DynamicForm type={category} />
            ) : (
              <div className="py-10 text-center">
                <p className="font-bold text-slate-500 italic">
                  Información de contacto directa aquí...
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
// src/components/sections/TextBlock.tsx
import Image from "next/image";

// Definimos qué props espera recibir este componente
export interface TextBlockProps {
  title?: string;
  text: string; // El único campo obligatorio
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right"; // Opción para mover la imagen
}

export default function TextBlock({
  title,
  text,
  imageUrl,
  imageAlt = "Imagen descriptiva", // Valor por defecto
  imagePosition = "right", // Valor por defecto
}: TextBlockProps) {
  
  // Lógica simple para ordenar en desktop usando Flexbox
  const textOrder = imagePosition === "left" ? "md:order-2" : "md:order-1";
  const imageOrder = imagePosition === "left" ? "md:order-1" : "md:order-2";

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Título opcional */}
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center md:text-left">
            {title}
          </h2>
        )}

        <div className="flex flex-col md:flex-row gap-10 md:items-center">
          
          {/* Bloque de Texto */}
          {/* Si no hay imagen, el texto ocupa todo el ancho (flex-1) */}
          <div className={`flex-1 space-y-4 ${imageUrl ? textOrder : ""}`}>
             {/* whitespace-pre-line permite que los saltos de línea de la DB se respeten */}
            <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-line">
              {text}
            </p>
          </div>

          {/* Bloque de Imagen (solo se renderiza si hay URL) */}
          {imageUrl && (
            <div className={`flex-1 relative h-72 md:h-[450px] w-full rounded-2xl overflow-hidden shadow-xl ${imageOrder}`}>
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          
        </div>
      </div>
    </section>
  );
}
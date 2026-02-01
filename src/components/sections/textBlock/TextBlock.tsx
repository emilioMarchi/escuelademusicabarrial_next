import Image from "next/image";

export interface TextBlockProps {
  title?: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
}

export default function TextBlock({
  title,
  text,
  imageUrl,
  imageAlt = "Imagen descriptiva",
  imagePosition = "right",
}: TextBlockProps) {
  
  // Estructuramos por párrafos reales
  const paragraphs = text.split("\n").filter(p => p.trim() !== "");

  const textOrder = imagePosition === "left" ? "md:order-2" : "md:order-1";
  const imageOrder = imagePosition === "left" ? "md:order-1" : "md:order-2";

  return (
    <section className="py-20  bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center">
          
          {/* BLOQUE DE TEXTO: Con contraste alto y espaciado de párrafos */}
          <div className={`flex-[1.2] p-6 w-full ${imageUrl ? textOrder : ""}`}>
            {title && (
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter leading-none text-center md:text-left">
                {title}
              </h2>
            )}

            <div className="space-y-6">
              {paragraphs.map((paragraph, index) => (
                <p 
                  key={index} 
                  className="text-slate-800 text-lg md:text-xl leading-relaxed font-normal"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* BLOQUE DE IMAGEN: Sin bordes, sin marcos, altura fija asegurada */}
          {imageUrl && (
            <div className={`flex-1 w-full ${imageOrder}`}>
              {/* Contenedor relativo con altura explícita para que 'fill' funcione */}
              <div className="relative h-80 md:h-[550px] w-full rounded-[2rem] overflow-hidden shadow-xl">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          )}
          
        </div>
      </div>
    </section>
  );
}
"use client";
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
  
  console.log("Posición recibida en TextBlock:", imagePosition);

  const paragraphs = text.split("\n").filter(p => p.trim() !== "");

  const TextContent = (
    <div className="w-full">
      {title && (
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9] text-center md:text-left">
          {title}
        </h2>
      )}
      <div className="space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-slate-700 text-lg md:text-xl leading-relaxed font-normal text-center md:text-left">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );

  const ImageContent = imageUrl ? (
    /* Agregamos padding (p-4 o p-8) para achicar la imagen visualmente */
    <div className="w-full flex justify-center items-center p-4 md:p-10">
      <div 
        className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200" 
        style={{ height: '500px' }} // Bajamos un pelín la altura para que sea más contenida
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          unoptimized
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>
  ) : null;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Mantenemos el grid-cols-2 que NO fallaba */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {imagePosition === "left" ? (
            <>
              {ImageContent}
              {TextContent}
            </>
          ) : (
            <>
              {TextContent}
              {ImageContent}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
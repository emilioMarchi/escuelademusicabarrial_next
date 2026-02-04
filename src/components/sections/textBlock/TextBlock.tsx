// src/components/sections/textBlock/TextBlock.tsx
"use client";
import Image from "next/image";
import { Music, Music2, Guitar, Mic2, Piano, Radio, Drum, Disc } from "lucide-react";
import { motion } from "framer-motion";

export interface TextBlockProps {
  title?: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
}

// Configuración de iconos: Punto medio (70px - 110px)
const backgroundIcons = [
  { Icon: Music, size: 80, color: "text-green-200/70", top: "8%", left: "4%", delay: 0, rotate: 15 },
  { Icon: Guitar, size: 110, color: "text-orange-200/50", top: "18%", right: "5%", delay: 2, rotate: -15 },
  { Icon: Drum, size: 95, color: "text-blue-200/60", bottom: "12%", left: "8%", delay: 1, rotate: 10 },
  { Icon: Mic2, size: 100, color: "text-green-200/50", bottom: "8%", right: "10%", delay: 3, rotate: -10 },
  { Icon: Piano, size: 85, color: "text-slate-200/70", top: "45%", left: "1%", delay: 4, rotate: 5 },
  { Icon: Disc, size: 75, color: "text-orange-200/60", bottom: "40%", right: "0%", delay: 1.5, rotate: 20 },
];

export default function TextBlock({
  title,
  text,
  imageUrl,
  imageAlt = "Imagen descriptiva",
  imagePosition = "right",
}: TextBlockProps) {
  
  const paragraphs = text.split("\n").filter(p => p.trim() !== "");

  const TextContent = (
    <div className="w-full relative z-10">
      {title && (
        <h2 className="font-serif italic text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-8 tracking-tight leading-[1.1] text-center md:text-left">
          {title}
        </h2>
      )}
      <div className="space-y-6">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-slate-600 text-lg md:text-xl leading-relaxed font-light text-center md:text-left">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );

  const ImageContent = imageUrl ? (
    <div className="w-full flex justify-center items-center p-4 md:p-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200" 
        style={{ height: '500px' }} // Altura restaurada a 500px
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[3.5rem]" />
      </motion.div>
    </div>
  ) : null;

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      
      {/* CAPA DE ICONOS DE FONDO EQUILIBRADA */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {backgroundIcons.map((item, idx) => (
          <motion.div
            key={idx}
            className={`absolute ${item.color}`}
            style={{ 
              top: item.top, 
              left: item.left, 
              right: item.right, 
              bottom: item.bottom 
            }}
            initial={{ rotate: item.rotate }}
            animate={{ 
              y: [0, -30, 0], // Movimiento un poco más sutil
              rotate: [item.rotate, item.rotate + 5, item.rotate - 5, item.rotate]
            }}
            transition={{ 
              duration: 10 + idx, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: item.delay
            }}
          >
            <item.Icon size={item.size} strokeWidth={0.75} />
          </motion.div>
        ))}
      </div>

      <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
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
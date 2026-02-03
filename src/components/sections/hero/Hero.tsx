"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface SlideButton {
  text: string;
  link: string;
  style: string;
}

interface Slide {
  image_url: string;
  image_alt?: string;
  title?: string;
  description?: string;
  buttons?: SlideButton[];
}

interface HeroProps {
  title?: string;        
  subtitle?: string;     
  description?: string;  
  slides?: Slide[];
  header_title?: string;
  header_description?: string;
}

export default function Hero({ 
  title, 
  subtitle, 
  description, 
  slides = [], 
  header_title, 
  header_description 
}: HeroProps) {
  
  const validSlides = slides.filter(s => s.image_url && s.image_url.trim() !== "");
  const [current, setCurrent] = useState(0);
  const hasImages = validSlides.length > 0;
  const currentSlide = hasImages ? validSlides[current] : null;

  // --- LÓGICA DE PRIORIDAD CORREGIDA ---
  
  // 1. Título Principal: Página > Sección > Slide > Fallback final
  const mainTitle = header_title || title || currentSlide?.title || "Escuela de Música";
  
  // 2. Descripción: Página > Subtitle Sección > Description Sección > Slide
  const mainDescription = header_description || subtitle || description || currentSlide?.description || "";

  // 3. Lógica del "Tag" (la etiqueta verde):
  // Solo la mostramos si el título que estamos usando NO es el del slide.
  // Así evitamos que el mismo texto aparezca repetido arriba y abajo.
  const showTag = currentSlide?.title && mainTitle !== currentSlide.title;

  useEffect(() => {
    if (!hasImages || validSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hasImages, validSlides.length]);

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* CAPA DE IMÁGENES */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatePresence mode="wait">
          {hasImages ? (
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              {validSlides[current]?.image_url && (
                <Image
                  src={validSlides[current].image_url}
                  alt={validSlides[current].image_alt || "Hero image"}
                  fill
                  className="object-cover opacity-50"
                  priority
                  unoptimized
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-slate-900" />
          )}
        </AnimatePresence>
      </div>

      {/* CONTENIDO */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          
          {/* Tag dinámico: Solo aparece si no se está usando como título principal */}
          <AnimatePresence mode="wait">
            {showTag && (
              <motion.span
                key={`st-${current}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-block bg-green-600 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-6 shadow-xl"
              >
                {currentSlide?.title}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Título Principal */}
          <motion.h1 
            key={`title-${mainTitle}`} // Para que anime si cambia el texto entre slides
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[0.85] uppercase"
          >
            {mainTitle}
          </motion.h1>

          {/* Subtítulo / Descripción */}
          <motion.p 
            key={`desc-${mainDescription}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            {mainDescription}
          </motion.p>

          {/* Botones */}
          <motion.div key={`sb-${current}`} className="flex flex-col sm:flex-row justify-center gap-4">
            {currentSlide?.buttons && currentSlide.buttons.length > 0 && (
              currentSlide.buttons.map((btn, idx) => (
                <Link 
                  key={idx} 
                  href={btn.link || "#"}
                  className={`px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 ${
                    btn.style === 'outline' 
                      ? "border-2 border-white text-white hover:bg-white hover:text-slate-900" 
                      : "bg-white text-slate-900 hover:bg-green-500 hover:text-white shadow-2xl border-2 border-transparent"
                  }`}
                >
                  {btn.text}
                </Link>
              ))
            )}
          </motion.div>

        </div>
      </div>

      {/* Dots */}
      {hasImages && validSlides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {validSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1 rounded-full transition-all duration-500 ${
                idx === current ? "w-10 bg-green-500" : "w-2 bg-white/20 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
// src/components/sections/hero/Hero.tsx
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
  title?: string;        // Título de la sección (Raíz)
  description?: string;  // Descripción de la sección (Raíz)
  subtitle?: string;     // <-- AGREGADO: Para compatibilidad con datos viejos
  slides?: Slide[];
}

export default function Hero({ 
  title, 
  description,
  subtitle, // <-- Lo recibimos
  slides = [] 
}: HeroProps) {
  
  const validSlides = slides.filter(s => s.image_url && s.image_url.trim() !== "");
  const [current, setCurrent] = useState(0);
  const hasImages = validSlides.length > 0;
  const currentSlide = hasImages ? validSlides[current] : null;

  // --- LÓGICA DE PRIORIDADES CORREGIDA ---
  
  // 1. Título Principal: Manda el del slide, si no hay, va el de la raíz.
  const displayTitle = (currentSlide?.title && currentSlide.title.trim() !== "") 
    ? currentSlide.title 
    : (title || "Escuela de Música Barrial");
  
  // 2. Descripción: Manda la del slide. Si no hay, busca description O subtitle.
  const displayDescription = (currentSlide?.description && currentSlide.description.trim() !== "") 
    ? currentSlide.description 
    : (description || subtitle || ""); 

  // 3. Tag (Opcional): Si estamos usando el título del SLIDE, 
  // podemos mostrar el nombre de la escuela (título raíz) arriba sutilmente.
  const showTag = (currentSlide?.title && currentSlide.title.trim() !== "") && title;

  useEffect(() => {
    if (!hasImages || validSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % validSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hasImages, validSlides.length]);

  return (
    // AJUSTE 1: h-[85vh] para mobile (más alto), md:h-[75vh] para desktop
    <section className="relative w-full h-[85vh] md:h-[75vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950">
      
      {/* CAPA DE IMÁGENES */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatePresence mode="wait">
          {hasImages ? (
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={validSlides[current].image_url}
                alt={validSlides[current].image_alt || "Hero image"}
                fill
                className="object-cover opacity-40 transition-all duration-1000"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-slate-950" />
          )}
        </AnimatePresence>
      </div>

      {/* CONTENIDO CENTRAL */}
      {/* AJUSTE 2: pt-24 para separar del Navbar */}
      <div className="relative z-10 container mx-auto px-6 text-center pt-24">
        <div className="max-w-3xl mx-auto">
          
          <AnimatePresence mode="wait">
            {showTag && (
              <motion.span
                key={`tag-${current}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-block border border-white/20 backdrop-blur-md text-white text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em] px-5 py-2 rounded-full mb-6"
              >
                {title}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.h1 
            key={`title-${displayTitle}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            // AJUSTE 3: leading-[0.95] (Menos espaciado entre renglones)
            className="font-serif italic text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight leading-[0.95]"
          >
            {displayTitle}
          </motion.h1>

          <motion.p 
            key={`desc-${displayDescription}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            // AJUSTE 4: leading-snug (Menos espaciado que relaxed)
            className="text-sm md:text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-snug font-light tracking-wide"
          >
            {displayDescription}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            {/* Usamos los botones del SLIDE actual */}
            {currentSlide?.buttons?.map((btn, idx) => (
              <Link 
                key={idx} 
                href={btn.link || "#"}
                className={`px-8 py-3.5 rounded-full font-bold uppercase text-[9px] tracking-[0.2em] transition-all duration-300 hover:scale-105 active:scale-95 ${
                  btn.style === 'outline' 
                    ? "border border-white/40 text-white hover:bg-white hover:text-slate-950 backdrop-blur-sm" 
                    : "bg-white text-slate-950 hover:bg-green-600 hover:text-white shadow-xl"
                }`}
              >
                {btn.text}
              </Link>
            ))}
          </motion.div>

        </div>
      </div>

      {/* NAVEGACIÓN POR PUNTOS */}
      {hasImages && validSlides.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {validSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1 rounded-full transition-all duration-700 ${
                idx === current ? "w-10 bg-green-500" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
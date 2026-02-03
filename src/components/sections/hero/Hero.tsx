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
  title?: string;        // Título de la sección (del admin)
  description?: string;  // Descripción de la sección (del admin)
  slides?: Slide[];
}

export default function Hero({ 
  title, 
  description, 
  slides = [] 
}: HeroProps) {
  
  const validSlides = slides.filter(s => s.image_url && s.image_url.trim() !== "");
  const [current, setCurrent] = useState(0);
  const hasImages = validSlides.length > 0;
  const currentSlide = hasImages ? validSlides[current] : null;

  // --- NUEVA LÓGICA DE PRIORIDADES ---
  
  // Verificamos si la sección tiene contenido propio
  const hasSectionTitle = Boolean(title && title.trim() !== "");
  const hasSectionDesc = Boolean(description && description.trim() !== "");

  // 1. Título: Si hay de sección, se usa ese. Si no, el del slide.
  const mainTitle = hasSectionTitle ? title : (currentSlide?.title || "Escuela de Música");
  
  // 2. Descripción: Si hay de sección, se usa esa. Si no, la del slide.
  const mainDescription = hasSectionDesc ? description : (currentSlide?.description || "");

  // 3. Etiqueta (Tag): Solo se muestra si el título principal es el de la SECCIÓN
  // y el slide tiene su propio título que ahora es "secundario".
  const tagContent = hasSectionTitle ? currentSlide?.title : null;

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
              <Image
                src={validSlides[current].image_url}
                alt={validSlides[current].image_alt || "Hero image"}
                fill
                className="object-cover opacity-50"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-slate-900" />
          )}
        </AnimatePresence>
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          
          <AnimatePresence mode="wait">
            {tagContent && (
              <motion.span
                key={`tag-${current}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="inline-block bg-green-600 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-6 shadow-xl"
              >
                {tagContent}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.h1 
            key={`title-${mainTitle}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[0.85] uppercase"
          >
            {mainTitle}
          </motion.h1>

          <motion.p 
            key={`desc-${mainDescription}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg md:text-2xl text-slate-200 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            {mainDescription}
          </motion.p>

          {/* Botones del Slide actual */}
          <motion.div key={`btns-${current}`} className="flex flex-col sm:flex-row justify-center gap-4">
            {currentSlide?.buttons?.map((btn, idx) => (
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
            ))}
          </motion.div>

        </div>
      </div>

      {/* Navegación por puntos */}
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
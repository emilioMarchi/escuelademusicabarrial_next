"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  image_url: string;
  image_alt: string;
}

interface HeroProps {
  title: string;
  description: string;
  slides?: Slide[];
}

export default function Hero({ title = "", description = "", slides = [] }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const hasImages = slides && slides.length > 0;

  useEffect(() => {
    if (!hasImages || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hasImages, slides.length]);

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* CAPA DE IMÁGENES */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <AnimatePresence mode="wait">
          {hasImages ? (
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Contenedor del zoom */}
              <motion.div
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={slides[current].image_url}
                  alt={slides[current].image_alt || "Banner"}
                  fill
                  priority
                  unoptimized
                  /* --- ESTO SOLUCIONA EL ESTIRAMIENTO --- */
                  style={{ objectFit: "cover", objectPosition: "center" }}
                  /* -------------------------------------- */
                  sizes="100vw"
                />
              </motion.div>
              <div className="absolute inset-0 bg-black/40 lg:bg-black/25" />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-white opacity-10">
               <div className="absolute top-0 left-0 w-64 h-64 bg-green-400 rounded-full blur-3xl" />
               <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-400 rounded-full blur-3xl" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* CONTENIDO (Z-10) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block px-4 py-1.5 mb-6 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border text-white bg-white/10 border-white/20 backdrop-blur-md"
          >
            Inscripciones Abiertas 2026
          </motion.span>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter"
          >
            {title}
          </motion.h1>

          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-200 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            {description}
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-5"
          >
            <button className="bg-green-600 hover:bg-green-700 text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-2xl shadow-green-900/20 active:scale-95">
              Explorar Clases
            </button>
            <button className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-black px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95">
              Apoyar el Proyecto
            </button>
          </motion.div>
        </div>
      </div>

      {/* INDICADORES (DOTS) */}
      {hasImages && slides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 rounded-full transition-all duration-500 ${i === current ? "w-10 bg-white" : "w-4 bg-white/30"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
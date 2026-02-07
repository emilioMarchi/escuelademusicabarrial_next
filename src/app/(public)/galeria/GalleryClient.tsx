"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export default function GalleryClient({ images }: { images: any[] }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const nextImg = () => setSelectedIdx(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  const prevImg = () => setSelectedIdx(prev => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));

  if (images.length === 0) return (
    <div className="text-center py-20">
      <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.4em]">Sin registros visuales</p>
    </div>
  );

  return (
    <div className="w-full">
      {/* GRID EDITORIAL: Gap mínimo para resaltar la pared de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[2px]">
        {images.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onClick={() => setSelectedIdx(idx)}
            className="group relative aspect-square overflow-hidden cursor-pointer bg-slate-200"
          >
            {/* SOLUCIÓN TÉCNICA:
              1. absolute inset-0: ocupa todo el espacio del padre.
              2. w-full h-full + min-w-full + min-h-full: garantiza que no quede espacio vacío.
              3. object-cover: recorta la imagen manteniendo la proporción (estilo background-cover).
              4. block: elimina espacios residuales de elementos inline.
            */}
            <img 
              src={img.url} 
              alt={img.caption || "Galería"} 
              className="absolute inset-0 block w-full h-full min-w-full min-h-full object-cover object-center transition-transform duration-1000 ease-in-out group-hover:scale-110"
            />
            
            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 size={20} strokeWidth={1} className="text-white" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* VISUALIZADOR (LIGHTBOX) */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white flex items-center justify-center"
          >
            <button 
              onClick={() => setSelectedIdx(null)} 
              className="absolute top-10 right-10 text-slate-900 hover:scale-110 transition-transform z-[210]"
            >
              <X size={32} strokeWidth={1} />
            </button>

            <button onClick={prevImg} className="absolute left-6 lg:left-12 text-slate-300 hover:text-slate-900 transition-colors z-[210]">
              <ChevronLeft size={48} strokeWidth={1} />
            </button>
            <button onClick={nextImg} className="absolute right-6 lg:right-12 text-slate-300 hover:text-slate-900 transition-colors z-[210]">
              <ChevronRight size={48} strokeWidth={1} />
            </button>

            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 lg:p-20">
              <motion.div
                key={selectedIdx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex flex-col items-center max-w-6xl w-full h-full justify-center"
              >
                <img
                  src={images[selectedIdx].url}
                  className="max-w-full max-h-[75vh] object-contain shadow-2xl bg-white p-2"
                  alt=""
                />
                <div className="mt-10 text-center space-y-2">
                  <p className="text-slate-400 font-black uppercase text-[8px] tracking-[0.5em]">
                    {String(selectedIdx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                  </p>
                  {images[selectedIdx].caption && (
                    <h3 className="text-slate-900 font-bold text-xs uppercase tracking-tighter max-w-xl mx-auto">
                      {images[selectedIdx].caption}
                    </h3>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
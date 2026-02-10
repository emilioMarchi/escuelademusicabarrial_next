"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";

export default function GalleryClient({ images }: { images: any[] }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isYoutube = (url: string) => url.includes("youtube.com") || url.includes("youtu.be");
  const isVideoFile = (url: string) => url.match(/\.(mp4|mov|webm|m4v)$/i);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const nextImg = () => setSelectedIdx(prev => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  const prevImg = () => setSelectedIdx(prev => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));

  // Bloquear el scroll de fondo
  useEffect(() => {
    if (selectedIdx !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedIdx]);

  if (images.length === 0) return null;

  return (
    <div className="w-full">
      {/* --- GRID EDITORIAL BLINDADO --- */}
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
            {isYoutube(img.url) ? (
              <img 
                src={`https://img.youtube.com/vi/${getYoutubeId(img.url)}/maxresdefault.jpg`} 
                className="absolute inset-0 block w-full h-full min-w-full min-h-full object-cover object-center transition-transform duration-1000 ease-in-out group-hover:scale-110"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${getYoutubeId(img.url)}/hqdefault.jpg`; }}
                alt=""
              />
            ) : isVideoFile(img.url) ? (
              <video src={img.url} muted className="absolute inset-0 block w-full h-full min-w-full min-h-full object-cover object-center transition-transform duration-1000 ease-in-out group-hover:scale-110" />
            ) : (
              <img src={img.url} className="absolute inset-0 block w-full h-full min-w-full min-h-full object-cover object-center transition-transform duration-1000 ease-in-out group-hover:scale-110" alt="" />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
              {(isYoutube(img.url) || isVideoFile(img.url)) ? (
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-xl"><Play size={20} fill="currentColor" /></div>
              ) : (
                <Maximize2 size={20} strokeWidth={1} className="text-white" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- PORTAL DEL VISUALIZADOR --- */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedIdx !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-between"
            >
              {/* BOTONES DE CONTROL */}
              <button onClick={() => setSelectedIdx(null)} className="absolute top-6 right-6 lg:top-8 lg:right-8 text-slate-900 hover:rotate-90 transition-transform z-[100001] bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm">
                <X size={28} strokeWidth={1.5} />
              </button>

              <button onClick={prevImg} className="absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors z-[100001] bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm">
                <ChevronLeft size={40} strokeWidth={1} />
              </button>

              <button onClick={nextImg} className="absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors z-[100001] bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm">
                <ChevronRight size={40} strokeWidth={1} />
              </button>

              {/* ÁREA MULTIMEDIA MAXIMIZADA (95vw y sin padding excesivo) */}
              <div className="flex-1 w-full max-w-[95vw] flex items-center justify-center p-2 md:p-4 overflow-hidden relative">
                <motion.div
                  key={selectedIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {isYoutube(images[selectedIdx].url) ? (
                    <div className="w-full max-w-6xl aspect-video shadow-2xl bg-black max-h-[85vh]">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeId(images[selectedIdx].url)}?autoplay=1&rel=0`}
                        className="w-full h-full border-none"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                  ) : isVideoFile(images[selectedIdx].url) ? (
                    <video
                      src={images[selectedIdx].url}
                      controls
                      autoPlay
                      className="max-w-full max-h-full object-contain shadow-2xl bg-black"
                    />
                  ) : (
                    <img
                      src={images[selectedIdx].url}
                      className="max-w-full max-h-full object-contain shadow-2xl"
                      alt=""
                    />
                  )}
                </motion.div>
              </div>

              {/* PIE DE INFO */}
              <div className="w-full text-center px-6 py-8 bg-white z-[105]">
                <p className="text-slate-400 font-black uppercase text-[8px] tracking-[0.5em] mb-1">
                  {String(selectedIdx + 1).padStart(2, '0')} — {String(images.length).padStart(2, '0')}
                </p>
                {images[selectedIdx].caption && (
                  <h3 className="text-slate-900 font-bold text-xs uppercase tracking-tighter max-w-2xl mx-auto leading-relaxed">
                    {images[selectedIdx].caption}
                  </h3>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
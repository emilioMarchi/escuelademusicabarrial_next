// src/components/sections/Hero/Hero.tsx
import React from "react";

interface HeroProps {
  title: string;
  description: string;
}

export default function Hero({ title, description }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-white py-20 px-6">
      {/* Detalle Multi-color de fondo para Diversidad */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge con borde multi-color */}
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 rounded-full">
          Inscripciones Abiertas 2026
        </span>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.1]">
          {title.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 0 ? "text-green-600" : "text-orange-500"}>
              {word}{" "}
            </span>
          ))}
        </h1>

        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-200">
            Explorar Clases
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-200">
            Apoyar el Proyecto
          </button>
        </div>
      </div>

      {/* Barra decorativa multi-color al pie del Hero */}
      <div className="absolute bottom-0 left-0 w-full h-2 flex">
        <div className="flex-1 bg-green-500"></div>
        <div className="flex-1 bg-orange-500"></div>
        <div className="flex-1 bg-blue-500"></div>
        <div className="flex-1 bg-purple-500"></div>
        <div className="flex-1 bg-yellow-500"></div>
      </div>
    </section>
  );
}
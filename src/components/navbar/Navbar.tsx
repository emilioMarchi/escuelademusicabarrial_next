// src/components/navbar/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllPagesForMenu } from "@/services/pages-services";
import { PageContent } from "@/types";

export default function Navbar() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getAllPagesForMenu().then(setPages);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo con Verde de Marca */}
          <Link href="/" className="text-2xl font-black tracking-tighter flex items-center">
            <span className="text-green-600">EM</span>
            <span className="text-orange-500">B</span>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {pages.map((page) => (
              <Link 
                key={page.id} 
                href={page.slug === 'inicio' ? '/' : `/${page.slug}`}
                className="text-sm font-bold text-slate-700 hover:text-green-600 transition-colors capitalize tracking-wide"
              >
                {page.slug === 'inicio' ? 'Inicio' : page.slug.replace("-", " ")}
              </Link>
            ))}
            
            {/* CTA con Anaranjado de Marca */}
            <Link 
              href="/contacto" 
              className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-orange-600 transition-all shadow-md shadow-orange-100 uppercase tracking-tighter"
            >
              Inscribirme
            </Link>
          </div>

          {/* Botón Móvil */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menú de navegación"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menú Móvil Desplegable */}
        {isOpen && (
          <div className="md:hidden pb-6 space-y-4 border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-2">
            {pages.map((page) => (
              <Link 
                key={page.id}
                href={page.slug === 'inicio' ? '/' : `/${page.slug}`}
                onClick={() => setIsOpen(false)}
                className="block text-lg font-bold text-slate-700 hover:text-green-600 capitalize"
              >
                {page.slug === 'inicio' ? 'Inicio' : page.slug.replace("-", " ")}
              </Link>
            ))}
            <Link 
              href="/contacto"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center bg-orange-500 text-white px-5 py-4 rounded-2xl font-black uppercase tracking-tighter"
            >
              Inscribirme
            </Link>
          </div>
        )}
      </div>

      {/* Detalle de Diversidad: Línea multicolor al pie del Nav */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] flex">
        <div className="flex-1 bg-green-500"></div>
        <div className="flex-1 bg-orange-500"></div>
        <div className="flex-1 bg-yellow-400"></div>
        <div className="flex-1 bg-blue-500"></div>
        <div className="flex-1 bg-purple-500"></div>
        <div className="flex-1 bg-red-500"></div>
      </div>
    </nav>
  );
}
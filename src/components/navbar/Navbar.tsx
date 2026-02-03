// src/components/navbar/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllPagesForMenu } from "@/services/pages-services";
import { PageContent } from "@/types";

// ORDEN DEFINIDO POR EL USUARIO
const MENU_ORDER = ["inicio", "nosotros", "clases", "novedades", "noticias", "contacto", "donaciones", "como-ayudar"];

export default function Navbar() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getAllPagesForMenu().then((data) => {
      // Ordenamos las páginas según la lista MENU_ORDER
      const sorted = data.sort((a, b) => {
        const indexA = MENU_ORDER.indexOf(a.slug);
        const indexB = MENU_ORDER.indexOf(b.slug);
        
        // Si no está en la lista, va al final
        const valA = indexA === -1 ? 999 : indexA;
        const valB = indexB === -1 ? 999 : indexB;
        
        return valA - valB;
      });
      setPages(sorted);
    });
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm shadow-sm transition-all">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-3xl font-black tracking-tighter flex items-center gap-1">
            <span className="text-green-600">EM</span>
            <span className="text-slate-900">B</span>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {pages.map((page) => (
              <Link 
                key={page.id} 
                href={page.slug === 'inicio' ? '/' : `/${page.slug}`}
                className="text-xs font-bold text-slate-600 hover:text-green-600 uppercase tracking-widest transition-colors"
              >
                {page.slug === 'inicio' ? 'Inicio' : page.slug.replace("-", " ")}
              </Link>
            ))}
            {/* Botón CTA Fijo (opcional, si quieres mantenerlo aparte) */}
            <Link 
              href="/contacto"
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-lg hover:shadow-green-900/20"
            >
              Inscribirme
            </Link>
          </div>

          {/* Botón Móvil */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2">
              <span className="sr-only">Abrir menú</span>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>

        {/* Menú Móvil Desplegable */}
        {isOpen && (
          <div className="md:hidden pb-6 space-y-2 border-t border-slate-100 pt-4 bg-white absolute left-0 right-0 px-6 shadow-xl z-50">
            {pages.map((page) => (
              <Link 
                key={page.id}
                href={page.slug === 'inicio' ? '/' : `/${page.slug}`}
                onClick={() => setIsOpen(false)}
                className="block text-lg font-black text-slate-800 hover:text-green-600 uppercase tracking-tight py-2 border-b border-slate-50"
              >
                {page.slug === 'inicio' ? 'Inicio' : page.slug.replace("-", " ")}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
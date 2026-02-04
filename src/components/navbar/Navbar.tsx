// src/components/navbar/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Para detectar la ruta activa
import { getAllPagesForMenu } from "@/services/pages-services";
import { PageContent } from "@/types";

const MENU_ORDER = ["inicio", "nosotros", "clases", "novedades", "noticias", "contacto", "donaciones", "como-ayudar"];

export default function Navbar() {
  const pathname = usePathname();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- DETECTAR SCROLL PARA ACHICAR ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    getAllPagesForMenu().then((data) => {
      const sorted = data.sort((a, b) => {
        const indexA = MENU_ORDER.indexOf(a.slug);
        const indexB = MENU_ORDER.indexOf(b.slug);
        const valA = indexA === -1 ? 999 : indexA;
        const valB = indexB === -1 ? 999 : indexB;
        return valA - valB;
      });
      setPages(sorted);
    });
  }, []);

  return (
    <nav 
      className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out border-b ${
        isScrolled 
          ? "h-14 bg-white/80 backdrop-blur-lg border-slate-100 shadow-sm" 
          : "h-24 bg-white border-transparent"
      }`}
    >
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Logo que se achica */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className={`font-black tracking-tighter text-green-600 transition-all duration-500 ${isScrolled ? 'text-xl' : 'text-3xl'}`}>
            EM
          </span>
          <span className={`font-black tracking-tighter text-slate-900 transition-all duration-500 ${isScrolled ? 'text-xl' : 'text-3xl'}`}>
            B
          </span>
        </Link>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {pages.map((page) => {
            const href = page.slug === 'inicio' ? '/' : `/${page.slug}`;
            const isActive = pathname === href;

            return (
              <Link 
                key={page.id} 
                href={href}
                className={`relative text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 py-2 ${
                  isActive 
                    ? "text-green-600" 
                    : "text-slate-400 hover:text-slate-900"
                }`}
              >
                {page.slug === 'inicio' ? 'Inicio' : page.slug.replace("-", " ")}
                
                {/* Indicador de página activa */}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 rounded-full" />
                )}
              </Link>
            );
          })}
          
          {/* Botón que se achica o se oculta */}
          <Link 
            href="/contacto"
            className={`bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-lg active:scale-95 flex items-center justify-center ${
              isScrolled ? "px-4 py-2 rounded-lg opacity-80" : "px-6 py-3 rounded-xl"
            }`}
          >
            {isScrolled ? "Inscribirme" : "Inscribirme hoy"}
          </Link>
        </div>

        {/* Botón Móvil */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2">
            <svg className={`w-8 h-8 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú Móvil - Adaptado al nuevo alto */}
      <div 
        className={`md:hidden bg-white border-t border-slate-100 transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-screen opacity-100 py-8 px-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-6">
          {pages.map((page) => {
            const href = page.slug === 'inicio' ? '/' : `/${page.slug}`;
            const isActive = pathname === href;

            return (
              <Link 
                key={page.id}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-black uppercase tracking-tighter ${
                  isActive ? "text-green-600" : "text-slate-900"
                }`}
              >
                {page.slug === 'inicio' ? 'Inicio' : page.slug.replace("-", " ")}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
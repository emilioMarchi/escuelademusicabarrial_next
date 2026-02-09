// src/components/navbar/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAllPagesForMenu } from "@/services/pages-services";
import { PageContent } from "@/types";

const MENU_ORDER = ["inicio", "nosotros", "clases", "novedades", "noticias", "contacto", "galeria", "como-ayudar"];

export default function Navbar() {
  const pathname = usePathname();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
          ? "h-12 bg-white/80 backdrop-blur-lg border-slate-100 shadow-sm" // Altura reducida a h-12
          : "h-16 bg-white border-transparent" // Altura inicial reducida a h-16
      }`}
    >
      <div className="container mx-auto h-full px-6 flex items-center justify-between">
      
        {/* Logo con imagen y nombre al lado */}
      <Link href="/" className="flex items-center gap-3 group">
        <img 
          src="/favicon.png" 
          alt="Logo Escuela de Música Barrial" 
          className={`transition-all duration-500 object-contain ${
            isScrolled ? "h-7 w-7" : "h-9 w-9"
          }`} 
        />
        <div className="flex flex-col leading-none">
          <span className={`
            font-serif italic text-slate-800 transition-all duration-500 tracking-tight
            ${isScrolled ? "text-sm" : "text-base md:text-lg"}
          `}>
            Escuela de Música
          </span>
          <span className={`
            font-sans font-black uppercase text-green-600 transition-all duration-500 tracking-[0.2em]
            ${isScrolled ? "text-[7px]" : "text-[9px]"}
          `}>
            Barrial
          </span>
        </div>
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
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-600 rounded-full" />
                )}
              </Link>
            );
          })}
          
          <Link 
            href="/contacto"
            className={`bg-orange-400 text-white font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-lg active:scale-95 flex items-center justify-center ${
              isScrolled ? "px-3 py-1.5 rounded-lg" : "px-4 py-2 rounded-xl"
            }`}
          >
            Inscribirme
          </Link>
        </div>

        {/* Botón Móvil */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-900 p-2">
            <svg className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Menú Móvil */}
      <div 
        className={`md:hidden bg-white border-t border-slate-100 transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-screen opacity-100 py-6 px-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-4">
          {pages.map((page) => {
            const href = page.slug === 'inicio' ? '/' : `/${page.slug}`;
            const isActive = pathname === href;

            return (
              <Link 
                key={page.id}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`text-xl font-black uppercase tracking-tighter ${
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
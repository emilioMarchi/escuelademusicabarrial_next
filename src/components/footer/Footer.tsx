"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { getAllPagesForMenu } from "@/services/pages-services";
import { PageContent } from "@/types";

// Mantenemos el mismo orden que en el Navbar para que el sitio sea coherente
const MENU_ORDER = ["inicio", "nosotros", "clases", "novedades", "noticias", "contacto", "galeria", "como-ayudar"];

interface FooterData {
  address: string;
  email: string;
  phone: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export default function Footer({ data }: { data: FooterData }) {
  const [isMounted, setIsMounted] = useState(false);
  const [pages, setPages] = useState<PageContent[]>([]);

  // 1. Manejo de Hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Carga dinámica del menú (Igual que en el Navbar)
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

  const apiKey = process.env.NEXT_PUBLIC_MAP_KEY;
  const searchQuery = encodeURIComponent(`Escuela de Música Barrial, ${data?.address}, Santa Fe, Argentina`);
  
  // URL Corregida de Google Maps Embed
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${searchQuery}`;

  if (!isMounted) {
    return <footer className="bg-slate-900 min-h-[400px]" />;
  }

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* COLUMNA 1: IDENTIDAD */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <img src="/favicon.png" alt="Logo" className="h-10 w-10 brightness-0 invert" />
              <div className="flex flex-col leading-none">
                <span className="font-serif italic text-white text-lg leading-tight">Escuela de Música</span>
                <span className="font-sans font-black uppercase text-green-500 text-[9px] tracking-widest">Barrial</span>
              </div>
            </Link>
            <p className="text-sm font-light text-slate-400 italic">
              "Transformando realidades a través de la música en el corazón del barrio."
            </p>
            
            <div className="flex gap-5 pt-2">
              {data?.instagram && (
                <a href={data.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-500 transition-all">
                  <Instagram size={22} />
                </a>
              )}
              {data?.facebook && (
                <a href={data.facebook} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-500 transition-all">
                  <Facebook size={22} />
                </a>
              )}
              {data?.youtube && (
                <a href={data.youtube} target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-500 transition-all">
                  <Youtube size={22} />
                </a>
              )}
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN DINÁMICA */}
          <div>
            <h4 className="font-serif italic text-white text-lg mb-6">Navegación</h4>
            <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest">
              {pages.map((page) => (
                <li key={page.id}>
                  <Link 
                    href={page.slug === 'inicio' ? '/' : `/${page.slug}`} 
                    className="hover:text-green-500 transition-all"
                  >
                    {page.slug === 'inicio' ? 'Inicio' : page.slug.replace("-", " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: CONTACTO */}
          <div>
            <h4 className="font-serif italic text-white text-lg mb-6">Contacto</h4>
            <ul className="space-y-5 text-sm font-light">
              <li className="flex items-start gap-3">
                <MapPin className="text-green-500 shrink-0" size={18} />
                <span>{data?.address}, Santa Fe</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-green-500 shrink-0" size={18} />
                <span>{data?.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-green-500 shrink-0" size={18} />
                <span className="break-all">{data?.email}</span>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: MAPA */}
          <div className="h-64 lg:h-full min-h-[220px] rounded-[2rem] overflow-hidden bg-slate-800 border border-slate-700 shadow-2xl">
            {apiKey ? (
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={mapUrl}
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-slate-500 font-black uppercase tracking-widest">
                Configurar Google Maps
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            © {new Date().getFullYear()} Escuela de Música Barrial.
          </p>
          <p className="text-[9px] font-black uppercase tracking-tighter text-slate-700">
            Santa Fe, Argentina
          </p>
        </div>
      </div>
    </footer>
  );
}
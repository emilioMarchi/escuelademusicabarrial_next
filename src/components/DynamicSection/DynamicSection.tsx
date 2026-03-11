// src/components/sections/DynamicSection/DynamicSection.tsx
"use client";
import { useRef } from "react";
import CardItem from "@/components/CardItem/CardItem";
import { UniversalCardData } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  items: UniversalCardData[];
  layout: "slider" | "grid";
  basePath: string;
}

export default function DynamicSection({ title, description, items, layout, basePath }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, children } = scrollRef.current;
      const firstCard = children[0] as HTMLElement;
      if (!firstCard) return;

      const cardWidth = firstCard.offsetWidth;
      const gap = 24; // gap-6
      const scrollAmount = cardWidth + gap;
      
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // Detectamos el color predominante. Si no hay items, usamos slate por defecto.
  const rawColor = items.length > 0 ? items[0].color : "default";
  const sectionColor = (rawColor === "orange" || rawColor === "green") ? rawColor : "default";

  // PALETA DE COLORES INTENCIONAL (Sin transparencias raras para evitar el gris)
  const styles = {
    orange: {
      section: "bg-orange-50 border-orange-100", // Color crema anaranjado claro
      accent: "bg-orange-500 shadow-md shadow-orange-200",
      title: "text-slate-900",
      desc: "text-orange-900/60",
      tag: "text-orange-600",
      btn: "bg-white text-orange-600 hover:bg-orange-500 hover:text-white"
    },
    green: {
      section: "bg-green-50 border-green-100", // Color menta muy claro
      accent: "bg-green-600 shadow-md shadow-green-200",
      title: "text-slate-900",
      desc: "text-green-900/60",
      tag: "text-green-600",
      btn: "bg-white text-green-600 hover:bg-green-600 hover:text-white"
    },
    default: {
      section: "bg-slate-50 border-slate-100",
      accent: "bg-slate-900",
      title: "text-slate-900",
      desc: "text-slate-500",
      tag: "text-slate-400",
      btn: "bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
    }
  };

  const current = styles[sectionColor as keyof typeof styles];

  return (
    <section className={`py-12 md:py-16 overflow-hidden border-y transition-colors duration-700 ${current.section}`}>
      <div className="container mx-auto px-6">
        
        {/* ENCABEZADO */}
        <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className={`font-serif italic text-3xl md:text-5xl tracking-tight leading-none mb-4 ${current.title}`}>
              {title}
            </h2>
            {description && (
              <p className={`text-sm md:text-base font-medium leading-relaxed max-w-xl ${current.desc}`}>
                {description}
              </p>
            )}
            <div className={`h-1.5 w-16 mt-6 rounded-full transition-all duration-500 ${current.accent}`}></div>
          </div>
          
          {layout === "slider" && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex gap-2">
                <button 
                  onClick={() => scroll("left")} 
                  className={`p-3 rounded-full border border-slate-200 transition-all shadow-sm ${current.btn}`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scroll("right")} 
                  className={`p-3 rounded-full border border-slate-200 transition-all shadow-sm ${current.btn}`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${current.tag}`}>
                Desliza para explorar →
              </p>
            </div>
          )}
        </div>
        
        {/* CONTENIDO */}
        {layout === "slider" ? (
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth -mx-6 px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item) => (
              <div key={item.id} className="snap-center md:snap-start flex-shrink-0 w-[85vw] md:w-[calc((100%-3rem)/3)] transition-all duration-500 hover:scale-[1.02] active:scale-95">
                <CardItem 
                  data={item} 
                  basePath={basePath} 
                  hideDescription={false} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <CardItem 
                key={item.id} 
                data={item} 
                basePath={basePath} 
                hideDescription={false} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
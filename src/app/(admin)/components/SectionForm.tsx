"use client";
import { useRef } from "react";
import { SectionData } from "@/types";
import { Reorder, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Image as ImageIcon, 
  AlignLeft, 
  AlignRight,
  Upload
} from "lucide-react";

interface Props {
  section: SectionData;
  onChange: (updatedContent: any, updatedSettings?: any) => void;
}

export default function SectionForm({ section, onChange }: Props) {
  // Refs para disparar el explorador de archivos
  const mainFileRef = useRef<HTMLInputElement>(null);
  const slideFileRef = useRef<HTMLInputElement>(null);
  const activeSlideIdx = useRef<number | null>(null);

  if (typeof section === 'string') return null;
  const { type, content, settings } = section;
  const currentLayout = settings?.layout || 'image-left';

  const updateField = (field: string, value: any) => {
    onChange({ ...content, [field]: value }, settings);
  };

  const updateSettings = (field: string, value: any) => {
    onChange(content, { ...settings, [field]: value });
  };

  // --- Lógica de Archivos ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isHero: boolean, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Por ahora creamos una URL local para la previsualización
    // (Luego implementaremos la subida real a Firebase Storage)
    const localUrl = URL.createObjectURL(file);

    if (isHero && index !== undefined) {
      const newSlides = [...(content.slides || [])];
      newSlides[index].image_url = localUrl;
      updateField('slides', newSlides);
    } else if (isHero && index === undefined) {
      const newSlides = [...(content.slides || []), { image_url: localUrl, image_alt: file.name }];
      updateField('slides', newSlides);
    } else {
      updateField('image_url', localUrl);
    }
  };

  const removeSlide = (index: number) => {
    const newSlides = content.slides?.filter((_, i) => i !== index);
    updateField('slides', newSlides);
  };

  return (
    <div className="space-y-10">
      {/* INPUTS OCULTOS PARA ARCHIVOS */}
      <input 
        type="file" 
        ref={mainFileRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => handleFileChange(e, false)} 
      />
      <input 
        type="file" 
        ref={slideFileRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => handleFileChange(e, true, activeSlideIdx.current ?? undefined)} 
      />

      {/* 1. SECCIÓN DE TEXTOS */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Título</label>
          <input 
            type="text"
            value={content.title || ""}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full p-5 bg-slate-50 rounded-[2rem] border-none font-bold text-slate-900 focus:ring-2 focus:ring-green-500 shadow-inner transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Descripción</label>
          <textarea 
            rows={4}
            value={content.description || content.subtitle || ""}
            onChange={(e) => updateField(type === 'hero' ? 'subtitle' : 'description', e.target.value)}
            className="w-full p-5 bg-slate-50 rounded-[2rem] border-none font-medium text-slate-700 focus:ring-2 focus:ring-green-500 shadow-inner transition-all"
          />
        </div>
      </div>

      {/* 2. GESTIÓN HERO (Explorador de archivos integrado) */}
      {type === 'hero' && (
        <div className="p-8 bg-slate-100/50 rounded-[3rem] border border-slate-200/60 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Galería del Banner</h4>
            <button 
              onClick={() => {
                activeSlideIdx.current = undefined;
                slideFileRef.current?.click();
              }}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg"
            >
              <Upload size={14} /> Cargar Foto
            </button>
          </div>

          <Reorder.Group axis="y" values={content.slides || []} onReorder={(newOrder) => updateField('slides', newOrder)} className="space-y-3">
            <AnimatePresence>
              {content.slides?.map((slide, idx) => (
                <Reorder.Item key={slide.image_url + idx} value={slide} className="flex items-center gap-4 p-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <GripVertical className="text-slate-300" size={20} />
                  <div className="relative w-24 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                    <img src={slide.image_url} className="object-cover w-full h-full" alt="Preview" />
                  </div>
                  <div className="flex-1 truncate text-[10px] font-mono text-slate-400">
                    {slide.image_url.startsWith('blob:') ? 'Archivo listo para subir' : slide.image_url}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        activeSlideIdx.current = idx;
                        slideFileRef.current?.click();
                      }}
                      className="p-3 text-slate-400 hover:text-black transition-all"
                    >
                      <Plus size={16} />
                    </button>
                    <button onClick={() => removeSlide(idx)} className="p-3 text-slate-300 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}

      {/* 3. BLOQUE DE TEXTO (Sin input de URL, solo Explorador) */}
      {type === 'texto-bloque' && (
        <div className="p-8 bg-slate-50 rounded-[3rem] border border-slate-100 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full md:w-56 h-36 rounded-[2.5rem] overflow-hidden bg-slate-200 border-4 border-white shadow-2xl mx-auto">
                    {content.image_url ? (
                      <img src={content.image_url} className="object-cover w-full h-full" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-slate-400"/></div>
                    )}
                  </div>
                  <button 
                    onClick={() => mainFileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:bg-slate-800"
                  >
                    <Upload size={14} /> {content.image_url ? 'Cambiar Foto' : 'Agregar Foto'}
                  </button>
                </div>

                <div className="flex-1 w-full space-y-6">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Alineación</label>
                        <div className="flex p-2 bg-white rounded-3xl border border-slate-200 w-full md:w-fit gap-2 shadow-sm">
                            <button 
                                onClick={() => updateSettings('layout', 'image-left')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${currentLayout === 'image-left' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <AlignLeft size={16} /> Izquierda
                            </button>
                            <button 
                                onClick={() => updateSettings('layout', 'image-right')}
                                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${currentLayout === 'image-right' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <AlignRight size={16} /> Derecha
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
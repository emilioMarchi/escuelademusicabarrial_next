"use client";
import { SectionData } from "@/types";

interface Props {
  section: SectionData;
  onChange: (updatedContent: any) => void;
}

export default function SectionForm({ section, onChange }: Props) {
  const { type, content } = section;

  // Función auxiliar para actualizar campos individuales
  const updateField = (field: string, value: any) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* CAMPOS COMUNES: Título y Subtítulo */}
      {(type === 'hero' || type === 'texto-bloque' || type === 'clases') && (
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Título de la Sección</label>
            <input 
              type="text"
              defaultValue={content.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-bold text-slate-900"
            />
          </div>
          
          {(type === 'hero' || type === 'texto-bloque') && (
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Descripción / Subtítulo</label>
              <textarea 
                rows={3}
                defaultValue={content.description || content.subtitle}
                onChange={(e) => updateField(type === 'hero' ? 'subtitle' : 'description', e.target.value)}
                className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-medium text-slate-700"
              />
            </div>
          )}
        </div>
      )}

      {/* CAMPO ESPECÍFICO: Imagen única (Texto-Bloque) */}
      {type === 'texto-bloque' && (
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4">URL de Imagen</label>
          <input 
            type="text"
            defaultValue={content.image_url}
            onChange={(e) => updateField('image_url', e.target.value)}
            className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 font-mono text-xs"
          />
        </div>
      )}

      {/* CAMPO ESPECÍFICO: Slides (Hero) */}
      {type === 'hero' && content.slides && (
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Imágenes del Banner (Slides)</label>
          {content.slides.map((slide, sIdx) => (
            <div key={sIdx} className="p-4 bg-slate-100 rounded-2xl grid grid-cols-2 gap-4">
              <input 
                type="text"
                placeholder="URL de imagen"
                defaultValue={slide.image_url}
                onChange={(e) => {
                  const newSlides = [...content.slides!];
                  newSlides[sIdx].image_url = e.target.value;
                  updateField('slides', newSlides);
                }}
                className="p-3 bg-white rounded-xl border-none text-xs font-mono"
              />
              <input 
                type="text"
                placeholder="Texto Alt"
                defaultValue={slide.image_alt}
                onChange={(e) => {
                  const newSlides = [...content.slides!];
                  newSlides[sIdx].image_alt = e.target.value;
                  updateField('slides', newSlides);
                }}
                className="p-3 bg-white rounded-xl border-none text-xs font-bold"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
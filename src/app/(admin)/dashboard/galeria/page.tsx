"use client";
import { useEffect, useState, useRef } from "react";
import { 
  getGalleryImagesAdmin, 
  uploadAndAddImageAdmin, 
  deleteImageAdmin,
  updateImageOrderAdmin 
} from "@/services/admin-services";
import { GalleryImage } from "@/types";
import { 
  Plus, Trash2, Loader2, Image as ImageIcon, 
  CheckCircle, AlertCircle, X, Upload, Eye, GripVertical, Save, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";

// Interfaz para el estado de mensajes
interface StatusState {
  type: 'success' | 'error';
  message: string;
}

export default function AdminGaleria() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasChanged, setHasChanged] = useState(false);
  
  // PAGINACIÓN: Cuántas fotos se muestran en la lista de gestión
  const [visibleCount, setVisibleCount] = useState(10);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    setLoading(true);
    const res = await getGalleryImagesAdmin();
    if (res.success) {
      setImages(res.data as GalleryImage[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadImages(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // Referencia segura al form
    setIsUploading(true);
    const res = await uploadAndAddImageAdmin(new FormData(form));

    if (res.success) {
      setStatus({ type: 'success', message: "Imagen añadida con éxito" });
      setPreviewUrl(null);
      form.reset(); 
      await loadImages();
    } else {
      setStatus({ type: 'error', message: res.error || "Error al subir" });
    }
    setIsUploading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    const updatedOrder = images.map((img, i) => ({ id: img.id!, order: i }));
    const res = await updateImageOrderAdmin(updatedOrder);
    if (res.success) {
      setHasChanged(false);
      setStatus({ type: 'success', message: "Nuevo orden guardado" });
    }
    setIsSavingOrder(false);
    setTimeout(() => setStatus(null), 3000);
  };

  if (loading) return (
    <div className="p-20 text-center font-black uppercase text-slate-300 animate-pulse tracking-widest">
      Sincronizando Galería...
    </div>
  );

  return (
    <div className="p-4 lg:p-8 space-y-10 pb-40 max-w-[1100px] mx-auto">
      
      {/* HEADER COMPACTO CON BOTÓN DE GUARDADO FLOTANTE */}
      <header className="flex items-center justify-between gap-4 sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 border-b border-slate-50">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none">
            Galería <span className="text-slate-300">Admin</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-1">
            Gestión de orden y contenido
          </p>
        </div>

        <AnimatePresence>
          {hasChanged && (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0, x: 20 }} animate={{ scale: 1, opacity: 1, x: 0 }} exit={{ scale: 0.8, opacity: 0, x: 20 }}
              onClick={handleSaveOrder}
              disabled={isSavingOrder}
              className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
            >
              {isSavingOrder ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
              Guardar Cambios de Orden
            </motion.button>
          )}
        </AnimatePresence>
      </header>

      {/* FORMULARIO SUPER COMPACTO */}
      <section className="bg-slate-50 p-4 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-6">
          <label className={`relative w-14 h-14 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 overflow-hidden ${
            previewUrl ? 'border-green-500 bg-white' : 'border-slate-200 bg-white hover:border-slate-400'
          }`}>
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <Plus className="text-slate-300" size={20} />
            )}
            <input ref={fileInputRef} name="file" type="file" required accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>

          <div className="flex-1 w-full">
            <input 
              name="caption" 
              type="text" 
              placeholder="Escribe una descripción corta (Ej: Concierto Anual)..." 
              className="w-full bg-transparent p-2 text-base font-bold text-black border-b border-slate-200 outline-none focus:border-slate-900 transition-all placeholder:text-slate-300" 
            />
          </div>

          <button 
            disabled={isUploading || !previewUrl}
            className="w-full sm:w-auto px-10 h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 disabled:bg-slate-100 transition-all flex items-center justify-center gap-3"
          >
            {isUploading ? <Loader2 className="animate-spin" size={16}/> : <Upload size={16}/>}
            {isUploading ? "Subiendo..." : "Cargar Foto"}
          </button>
        </form>
      </section>

      {/* LISTA DE REORDENAMIENTO (TARJETAS GRANDES) */}
      {/* Usamos axis="y" para estabilidad total del Drag & Drop */}
      <section className="space-y-4">
        <Reorder.Group 
          axis="y" 
          values={images} 
          onReorder={(newOrder) => { setImages(newOrder); setHasChanged(true); }}
          className="space-y-3"
        >
          {images.slice(0, visibleCount).map((img, idx) => (
            <Reorder.Item 
              key={img.id} 
              value={img}
              className="relative bg-white p-3 rounded-[2rem] border border-slate-100 flex items-center gap-6 cursor-grab active:cursor-grabbing group hover:border-slate-300 hover:shadow-md transition-all"
            >
              {/* MANIJA DE ARRASTRE */}
              <div className="pl-2 text-slate-300 group-hover:text-slate-900 transition-colors">
                <GripVertical size={24} />
              </div>

              {/* MINIATURA GRANDE */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-slate-50">
                <img src={img.url} className="w-full h-full object-cover" alt="" />
              </div>

              {/* INFORMACIÓN */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-slate-100 text-slate-500 rounded-md tracking-widest">
                        Posición #{idx + 1}
                    </span>
                </div>
                <p className="text-sm font-bold text-black truncate pr-4">
                  {img.caption || <span className="text-slate-300 italic font-medium tracking-normal">Sin descripción</span>}
                </p>
              </div>

              {/* ACCIONES */}
              <div className="flex items-center gap-2 pr-4">
                <button 
                  type="button"
                  onClick={() => setSelectedImage(img.url)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                  title="Visualizar"
                >
                  <Eye size={20} />
                </button>
                <button 
                  type="button"
                  onClick={() => deleteImageAdmin(img.id!, img.url).then(loadImages)}
                  className="p-3 bg-red-50 text-red-200 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                  title="Eliminar"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* BOTÓN MOSTRAR MÁS (PAGINACIÓN) */}
        {images.length > visibleCount && (
          <div className="flex justify-center pt-8">
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="flex items-center gap-3 px-12 py-4 bg-white text-slate-400 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-200 shadow-sm"
            >
              <ChevronDown size={16} />
              Ver más fotos ({images.length - visibleCount} restantes)
            </button>
          </div>
        )}
      </section>

      {/* VISUALIZADOR (LIGHTBOX) */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 lg:p-12"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <img src={selectedImage} className="w-full h-auto max-h-[80vh] object-contain rounded-[2.5rem] shadow-2xl border border-white/10" alt="" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="mt-10 bg-white/10 hover:bg-white/20 text-white px-12 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.3em] transition-all border border-white/5"
              >
                Cerrar Previsualización
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENSAJE DE ESTADO FLOTANTE */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] px-8 py-4 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-3 border border-white/10"
          >
            {status.type === 'success' ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-red-400" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {status.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"use client";
import { useEffect, useState, useRef } from "react";
import { 
  getGalleryImagesAdmin, 
  uploadAndAddImageAdmin, 
  deleteImageAdmin,
  updateImageOrderAdmin,
  getPageAdmin,
  savePageConfigAdmin,
  uploadFileOnlyAdmin,
  addGalleryLinkAdmin
} from "@/services/admin-services";
import { GalleryImage, PageContent } from "@/types";
import { useDirtyState } from "@/context/DirtyStateContext";
import { 
  Plus, Trash2, Loader2, Image as ImageIcon, 
  CheckCircle, AlertCircle, Save, Settings2, 
  Upload, GripVertical, Layout, Type, Camera,
  Play, Video, Link as LinkIcon, X, Globe
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { getOptimizedImage } from "@/lib/image-utils"; // Asegúrate de que esta ruta sea correcta

export default function AdminGaleria() {
  const { setDirty: setGlobalDirty } = useDirtyState();
  
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [pageConfig, setPageConfig] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [hasChangesConfig, setHasChangesConfig] = useState(false);
  const [hasChangesOrder, setHasChangesOrder] = useState(false);
  
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [uploadType, setUploadType] = useState<'image' | 'video' | 'link'>('image');

  const headerFileRef = useRef<HTMLInputElement>(null);
  const mediaFileRef = useRef<HTMLInputElement>(null);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    const [imgRes, pageRes] = await Promise.all([
      getGalleryImagesAdmin(),
      getPageAdmin("galeria")
    ]);
    if (imgRes.success) setImages(imgRes.data as GalleryImage[]);
    if (pageRes.success) setPageConfig(pageRes.data as PageContent);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // --- GUARDADO DE CONFIGURACIÓN Y HEADER ---
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      if (hasChangesConfig) {
        let currentImageUrl = pageConfig?.header_image_url;
        
        // Si hay una foto de header nueva seleccionada
        if (headerFileRef.current?.files?.[0]) {
          const originalFile = headerFileRef.current.files[0];
          // OPTIMIZACIÓN ANTES DE SUBIR EL HEADER
          const optimizedHeader = await getOptimizedImage(originalFile);
          
          const formData = new FormData();
          formData.append("file", optimizedHeader);
          const uploadRes = await uploadFileOnlyAdmin(formData);
          if (uploadRes.success) currentImageUrl = uploadRes.url || "";
        }

        await savePageConfigAdmin("galeria", { 
            ...pageConfig, 
            header_image_url: currentImageUrl 
        } as PageContent);
      }

      if (hasChangesOrder) {
        const updateData = images.map((img, idx) => ({ 
          id: img.id, 
          order: idx,
          caption: img.caption || "" 
        }));
        await updateImageOrderAdmin(updateData);
      }
      
      setStatus({ type: 'success', message: "Galería sincronizada" });
      setGlobalDirty(false);
      setHasChangesConfig(false);
      setHasChangesOrder(false);
      setHeaderPreview(null);
      await loadData(true);
    } catch (e) {
      setStatus({ type: 'error', message: "Error al sincronizar" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  // --- SUBIDA DE NUEVO CONTENIDO (MULTIPLE) ---
  const handleMediaUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formDataRaw = new FormData(form);
    const caption = formDataRaw.get("caption") as string;
    const linkUrl = formDataRaw.get("link_url") as string;

    setIsUploading(true);
    try {
      if (uploadType === 'link') {
        if (!linkUrl) throw new Error("URL requerida");
        await addGalleryLinkAdmin(linkUrl, caption);
      } else {
        const files = mediaFileRef.current?.files;
        if (!files || files.length === 0) return;

        const fileList = Array.from(files);
        
        for (const f of fileList) {
            // OPTIMIZACIÓN: Solo comprime si es imagen, si es video pasa directo
            const optimizedFile = await getOptimizedImage(f);
            
            const formData = new FormData();
            formData.append("file", optimizedFile);
            formData.append("caption", caption); // Enviamos el pie de foto
            
            await uploadAndAddImageAdmin(formData);
        }
      }
      
      setStatus({ type: 'success', message: 'Contenido publicado' });
      setPhotoPreview(null);
      form.reset();
      loadData(true);
    } catch (error) {
        setStatus({ type: 'error', message: 'Error al publicar' });
    } finally {
        setIsUploading(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black uppercase text-slate-900 animate-pulse tracking-widest">Sincronizando Galería...</div>;

  return (
    <div className="p-4 lg:p-8 space-y-10 pb-40 max-w-5xl mx-auto relative">
      
      {/* HEADER PRINCIPAL */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b-2 border-slate-100">
        <div className="flex items-center gap-5">
          <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl">
             <ImageIcon size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Galería</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
              Contenido total: <span className="text-slate-900">{images.length} ítems</span>
            </p>
          </div>
        </div>
        {(hasChangesConfig || hasChangesOrder) && (
          <motion.button 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={handleSaveAll} disabled={isSaving}
            className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-green-600 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} 
            Guardar Cambios Pendientes
          </motion.button>
        )}
      </header>

      {/* SECCIÓN 1: TEXTOS Y PORTADA */}
      <section className={`p-10 rounded-[3.5rem] border-2 transition-all duration-500 relative bg-white ${hasChangesConfig ? 'border-orange-400 shadow-2xl shadow-orange-50' : 'border-slate-100 shadow-sm'}`}>
        <div className="flex items-center justify-between border-b-2 border-slate-50 pb-8 mb-8">
          <div className="flex items-center gap-3">
            <Settings2 size={24} className="text-slate-900"/>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Textos y Portada</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-900 ml-2 tracking-widest flex items-center gap-2">
                <Type size={12}/> Título Hero
              </label>
              <input 
                type="text" 
                value={pageConfig?.header_title || ""} 
                onChange={e => { setPageConfig(prev => prev ? {...prev, header_title: e.target.value} : null); setHasChangesConfig(true); setGlobalDirty(true); }}
                className="w-full text-black p-5 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-900 ml-2 tracking-widest flex items-center gap-2">
                <Layout size={12}/> Descripción Hero
              </label>
              <textarea 
                rows={2}
                value={pageConfig?.header_description || ""} 
                onChange={e => { setPageConfig(prev => prev ? {...prev, header_description: e.target.value} : null); setHasChangesConfig(true); setGlobalDirty(true); }}
                className="w-full text-black p-5 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-slate-900 outline-none transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 tracking-widest flex items-center gap-2">
                <Globe size={12}/> Meta Descripción (SEO)
              </label>
              <input 
                type="text" 
                value={pageConfig?.meta_description || ""} 
                onChange={e => { setPageConfig(prev => prev ? {...prev, meta_description: e.target.value} : null); setHasChangesConfig(true); setGlobalDirty(true); }}
                className="w-full text-black p-5 bg-slate-50 rounded-2xl text-xs font-bold border-2 border-transparent focus:border-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-900 ml-2 tracking-widest">Imagen de Fondo (Header)</label>
            <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden relative group border-2 border-slate-100 shadow-inner flex items-center justify-center">
              {(headerPreview || pageConfig?.header_image_url) ? (
                <img src={headerPreview || pageConfig?.header_image_url} className="w-full h-full object-cover" alt="Portada" />
              ) : (
                <ImageIcon className="text-slate-200" size={48}/>
              )}
              <button type="button" onClick={() => headerFileRef.current?.click()} className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-2">
                <Camera size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">Cambiar Fondo</span>
              </button>
            </div>
            <input type="file" ref={headerFileRef} className="hidden" accept="image/*" onChange={e => { e.target.files?.[0] && setHeaderPreview(URL.createObjectURL(e.target.files[0])); setHasChangesConfig(true); setGlobalDirty(true); }} />
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: SUBIDA MULTIMEDIA */}
      <section className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl overflow-hidden relative">
        <form onSubmit={handleMediaUpload} className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex flex-col gap-3">
             <div 
                onClick={() => uploadType !== 'link' && mediaFileRef.current?.click()}
                className={`w-44 h-44 shrink-0 bg-white/5 rounded-[2.5rem] border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center group relative
                  ${uploadType === 'link' ? 'border-white/5 cursor-default' : 'border-white/20 hover:border-white/60 cursor-pointer'}`}
              >
                {photoPreview ? (
                    <img src={photoPreview} className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center p-4">
                        {uploadType === 'image' ? <ImageIcon size={32} className="mx-auto mb-2 opacity-20 group-hover:opacity-100 transition-all"/> : <Video size={32} className="mx-auto mb-2 opacity-20 group-hover:opacity-100 transition-all"/>}
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-20">{uploadType === 'link' ? "Link" : "Seleccionar"}</span>
                    </div>
                )}
                {uploadType === 'link' && <div className="absolute inset-0 bg-slate-900 flex items-center justify-center"><LinkIcon size={40} className="text-white/20"/></div>}
              </div>
              
              <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/10">
                <button type="button" onClick={() => {setUploadType('image'); setPhotoPreview(null)}} className={`flex-1 py-2 rounded-lg transition-all ${uploadType === 'image' ? 'bg-white text-slate-900' : 'text-white/40'}`}><ImageIcon size={14} className="mx-auto"/></button>
                <button type="button" onClick={() => {setUploadType('video'); setPhotoPreview(null)}} className={`flex-1 py-2 rounded-lg transition-all ${uploadType === 'video' ? 'bg-white text-slate-900' : 'text-white/40'}`}><Video size={14} className="mx-auto"/></button>
                <button type="button" onClick={() => {setUploadType('link'); setPhotoPreview(null)}} className={`flex-1 py-2 rounded-lg transition-all ${uploadType === 'link' ? 'bg-white text-slate-900' : 'text-white/40'}`}><LinkIcon size={14} className="mx-auto"/></button>
              </div>
          </div>

          <input 
            type="file" 
            ref={mediaFileRef} 
            className="hidden" 
            accept={uploadType === 'image' ? 'image/*' : 'video/mp4,video/x-m4v,video/*'} 
            multiple={uploadType === 'image'} // Permitimos subir varias fotos juntas
            onChange={e => e.target.files?.[0] && setPhotoPreview(URL.createObjectURL(e.target.files[0]))} 
          />
          
          <div className="flex-1 w-full space-y-6">
            <div className="space-y-2">
               <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Publicar {uploadType === 'image' ? 'Nuevas Fotos' : 'Nuevo Contenido'}</h3>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {uploadType === 'link' ? "Pega el enlace de YouTube o Vimeo" : "Formatos optimizados a WebP automáticamente"}
               </p>
            </div>

            <div className="space-y-3">
                {uploadType === 'link' && (
                    <input name="link_url" type="text" placeholder="https://youtube.com/watch?v=..." className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-white/40 font-medium text-white transition-all" />
                )}
                <input name="caption" type="text" placeholder={`Escribe un pie de multimedia...`} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm outline-none focus:border-white/40 font-medium text-white transition-all" />
            </div>

            <button type="submit" disabled={isUploading} className="w-full md:w-auto px-12 py-5 bg-white text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-green-400 transition-all flex items-center justify-center gap-3 shadow-xl">
              {isUploading ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16}/>}
              Publicar en Galería
            </button>
          </div>
        </form>
      </section>

      {/* SECCIÓN 3: LISTA Y REORDENAMIENTO */}
      <section className={`p-10 rounded-[3.5rem] border-2 transition-all duration-500 bg-white relative ${hasChangesOrder ? 'border-orange-400 shadow-2xl shadow-orange-50' : 'border-slate-100 shadow-sm'}`}>
        <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-8 mb-8">
            <Layout size={24} className="text-slate-900"/>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Mosaico y Orden</h2>
        </div>

        <Reorder.Group axis="y" values={images} onReorder={(newOrder) => { setImages(newOrder); setHasChangesOrder(true); setGlobalDirty(true); }} className="space-y-4">
          {images.map((img, idx) => {
            const ytId = getYoutubeId(img.url);
            const isLocalVideo = img.url.match(/\.(mp4|mov|webm|m4v)$/i);

            return (
              <Reorder.Item key={img.id} value={img}>
                <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 flex flex-col md:flex-row items-center gap-8 group hover:border-slate-900 transition-all shadow-sm">
                  <div className="cursor-grab active:cursor-grabbing text-slate-200 hover:text-slate-900 transition-colors">
                      <GripVertical size={28} />
                  </div>
                  <div className="w-24 h-24 rounded-[1.8rem] overflow-hidden bg-slate-900 shrink-0 border-2 border-slate-100 shadow-inner flex items-center justify-center relative">
                      {ytId ? (
                          <>
                            <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} className="w-full h-full object-cover opacity-80" alt="YouTube" />
                            <Play size={20} className="absolute text-white drop-shadow-lg" fill="currentColor"/>
                          </>
                      ) : isLocalVideo ? (
                          <>
                              <video src={img.url} className="w-full h-full object-cover opacity-60" />
                              <Play size={24} className="absolute text-white"/>
                          </>
                      ) : (
                          <img src={img.url} className="w-full h-full object-cover object-center" alt="" />
                      )}
                  </div>
                  <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-2">
                         <Type size={12} className="text-slate-300" />
                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Pie de Multimedia</span>
                      </div>
                      <input 
                        type="text"
                        value={img.caption || ""}
                        onChange={(e) => {
                          const newImages = [...images];
                          newImages[idx] = { ...newImages[idx], caption: e.target.value };
                          setImages(newImages);
                          setHasChangesOrder(true);
                          setGlobalDirty(true);
                        }}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-900 p-3 rounded-xl text-sm font-bold text-slate-900 outline-none transition-all"
                      />
                  </div>
                  <button onClick={() => deleteImageAdmin(img.id, img.url).then(() => loadData(true))} className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 size={22} />
                  </button>
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </section>

      <AnimatePresence>
        {status && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[250] px-10 py-5 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-4 border border-white/10">
            {status.type === 'success' ? <CheckCircle className="text-green-400" size={20}/> : <AlertCircle className="text-red-400" size={20}/>}
            <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
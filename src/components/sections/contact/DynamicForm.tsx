"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { submitForm } from "@/actions/form-actions";
import { getInstrumentsPublic, getGroupsByClassPublic, getCollectionPublic } from "@/services/admin-services";
import { ContactSubmission, EnrollmentSubmission, Group, Class } from "@/types";
import { Info, Music, BookOpen } from "lucide-react";

interface DynamicFormProps {
  type: string;
  classId?: string;
  className?: string;
}

export default function DynamicForm({ type, classId: propClassId, className: propClassName }: DynamicFormProps) {
  const searchParams = useSearchParams();
  const comisionIdFromUrl = searchParams.get("comision");

  const [role, setRole] = useState<"alumno" | "docente">("alumno");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Estados para datos dinámicos
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [allInstruments, setAllInstruments] = useState<string[]>([]);
  const [filteredInstruments, setFilteredInstruments] = useState<string[]>([]);
  const [classGroups, setClassGroups] = useState<Group[]>([]);
  
  // Selección actual
  const [currentClassId, setCurrentClassId] = useState<string>(propClassId || "");
  const [currentClassName, setCurrentClassName] = useState<string>(propClassName || "");
  const [selectedGroupId, setSelectedGroupId] = useState<string>(comisionIdFromUrl || "");
  
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 0. Sincronización reactiva con la URL para el grupo seleccionado
  useEffect(() => {
    if (comisionIdFromUrl) {
      setSelectedGroupId(comisionIdFromUrl);
    }
  }, [comisionIdFromUrl]);

  // 1. Carga inicial: Instrumentos globales y Clases (si no hay una fija)
  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingData(true);
      const [instRes, classesRes] = await Promise.all([
        getInstrumentsPublic(),
        !propClassId ? getCollectionPublic("clases") : Promise.resolve({ success: true, data: [] })
      ]);

      if (instRes.success && instRes.data) {
        setAllInstruments(instRes.data);
      }
      if (classesRes.success && classesRes.data) {
        setAllClasses((classesRes.data as Class[]).filter(c => c.is_active));
      }
      setIsLoadingData(false);
    }
    loadInitialData();
  }, [propClassId]);

  // 2. Carga de grupos cuando cambia la clase seleccionada
  useEffect(() => {
    async function loadGroups() {
      if (type !== "clases" || !currentClassId) {
        setClassGroups([]);
        setSelectedGroupId("");
        return;
      }
      
      setIsLoadingData(true);
      const { success, data } = await getGroupsByClassPublic(currentClassId);
      if (success && data) {
        const groups = data as Group[];
        setClassGroups(groups);
        
        // Si hay una comisión en URL pero cambiamos de clase, la limpiamos
        // Si la comisión en URL pertenece a la clase actual, la mantenemos
        const belongs = groups.some(g => g.id === selectedGroupId);
        if (!belongs) setSelectedGroupId("");
      } else {
        setClassGroups([]);
        setSelectedGroupId("");
      }
      setIsLoadingData(false);
    }
    loadGroups();
  }, [type, currentClassId]);

  // 3. Filtrado de instrumentos por Clase/Grupo seleccionado
  useEffect(() => {
    async function filterInstruments() {
      if (type !== "clases") return;

      // Si no hay clase elegida, lista vacía
      if (!currentClassId) {
        setFilteredInstruments([]);
        return;
      }

      setIsLoadingData(true);
      
      if (selectedGroupId) {
        // Escenario A: Comisión específica
        const selectedGroup = classGroups.find(g => g.id === selectedGroupId);
        if (selectedGroup && selectedGroup.instruments?.length > 0) {
          setFilteredInstruments(selectedGroup.instruments);
        } else {
          // Si el grupo no tiene instrumentos específicos, fallback a los de la clase o vacio
          const classUnion = Array.from(new Set(classGroups.flatMap(g => g.instruments || [])));
          setFilteredInstruments(classUnion.length > 0 ? classUnion : []);
        }
      } else {
        // Escenario B: Clase seleccionada pero no grupo
        const union = Array.from(new Set(classGroups.flatMap(g => g.instruments || [])));
        setFilteredInstruments(union.length > 0 ? union : []);
      }
      setIsLoadingData(false);
    }

    filterInstruments();
  }, [type, currentClassId, selectedGroupId, classGroups]);

  // Handler para cambio de clase manual
  const handleClassChange = (id: string) => {
    setCurrentClassId(id);
    const cls = allClasses.find(c => c.id === id);
    setCurrentClassName(cls?.name || "");
    setSelectedGroupId(""); // Reset grupo al cambiar clase
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const currentGroup = classGroups.find(g => g.id === selectedGroupId);

    const finalData: EnrollmentSubmission | ContactSubmission = type === "clases" ? {
      type: "clases",
      role: role,
      fullname: formData.get("fullname") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || "",
      age: role === "alumno" ? Number(formData.get("age")) : undefined, // Edad para alumnos
      instrument: role === "docente" ? (formData.get("instrument") as string) : undefined, // Instrumento solo para docentes
      level_or_experience: formData.get("level") as string,
      class_id: currentClassId,
      class_name: currentClassName,
      group_id: selectedGroupId || undefined,
      group_name: currentGroup?.name || undefined,
      created_at: null, 
      status: "pendiente",
    } : {
      type: "contacto",
      fullname: formData.get("fullname") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || "",
      message: formData.get("message") as string,
      created_at: null,
      status: "nuevo",
    };

    const result = await submitForm(finalData);

    setIsPending(false);
    if (result.success) {
      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      alert("Hubo un error al enviar: " + result.error);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">¡Todo listo!</h3>
        <p className="text-slate-500 mt-3 font-medium px-4">
          Ya recibimos tu información. Nos pondremos en contacto con vos lo antes posible.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-500 transition-colors underline decoration-2 underline-offset-4"
        >
          Enviar otro formulario
        </button>
      </div>
    );
  }

  const selectedGroupName = classGroups.find(g => g.id === selectedGroupId)?.name;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* BANNER INFORMATIVO DINÁMICO */}
      {type === "clases" && currentClassName && (
        <div className="md:col-span-2 flex items-center gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl mb-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100 shrink-0">
             <Music size={18} className={role === "docente" ? "text-orange-500" : "text-emerald-600"} />
          </div>
          <p className="text-[11px] font-bold text-slate-800 leading-tight">
            {role === "docente" ? (
              <>Postulación para <span className="uppercase font-black text-orange-600">{currentClassName}</span> como <span className="uppercase font-black text-orange-600">Docente</span></>
            ) : selectedGroupName ? (
              <>Inscripción para <span className="uppercase font-black text-emerald-600">{currentClassName}</span> - Comisión: <span className="uppercase font-black text-emerald-600">{selectedGroupName}</span></>
            ) : (
              <>Interés en la clase de <span className="uppercase font-black text-emerald-600">{currentClassName}</span></>
            )}
          </p>
        </div>
      )}

      {/* DATOS PERSONALES */}
      <div className="md:col-span-1 flex flex-col">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
          Nombre Completo
        </label>
        <input name="fullname" type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-400 outline-none transition-all mt-auto text-slate-900" placeholder="Ej: Juan Pérez" required />
      </div>

      <div className="md:col-span-1 flex flex-col">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
          Correo Electrónico
        </label>
        <input name="email" type="email" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-400 outline-none transition-all mt-auto text-slate-900" placeholder="Ej: hola@tuemail.com" required />
      </div>

      <div className="md:col-span-2 flex flex-col">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
          Teléfono (Opcional)
        </label>
        <input name="phone" type="tel" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-400 outline-none transition-all mt-auto text-slate-900" placeholder="Ej: +54 9 11 1234 5678" />
      </div>

      {/* SELECTOR DE ROL (ALUMNO / DOCENTE) */}
      {type === "clases" && (
        <div className="md:col-span-2 flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole("alumno")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
              role === "alumno" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 opacity-60"
            }`}
          >
            Quiero Estudiar
          </button>
          <button
            type="button"
            onClick={() => setRole("docente")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
              role === "docente" ? "bg-white text-orange-500 shadow-sm" : "text-slate-500 opacity-60"
            }`}
          >
            Quiero Ser Profe
          </button>
        </div>
      )}

      {/* SELECTOR DE CLASE (Si no viene por prop) */}
      {type === "clases" && !propClassId && (
        <div className="md:col-span-2 flex flex-col">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
            ¿Qué disciplina te interesa?
          </label>
          <div className="relative">
            <select 
              value={currentClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-400 outline-none transition-all text-slate-900 appearance-none"
              required
            >
              <option value="">Seleccionar una clase...</option>
              {allClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
               <BookOpen size={16} />
            </div>
          </div>
        </div>
      )}

      {/* SELECTOR DE COMISIÓN (Solo Alumnos) */}
      {type === "clases" && role === "alumno" && currentClassId && classGroups.length > 0 && (
        <div className="md:col-span-2 flex flex-col animate-in slide-in-from-top-2 duration-300">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
            Seleccionar Comisión / Horario
          </label>
          <select 
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-400 outline-none transition-all mt-auto text-slate-900"
          >
            <option value="">Cualquier comisión / No lo sé aún</option>
            {classGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} — {group.schedule}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* DATOS DE FORMACIÓN (Instrumento / Nivel / Edad) */}
      {type === "clases" && (
        <>
          {role === "alumno" ? (
            <div className="md:col-span-1 flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
                Edad del Alumno/a
              </label>
              <input name="age" type="number" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-400 outline-none transition-all mt-auto text-slate-900" placeholder="Ej: 12" required />
            </div>
          ) : (
            <div className={`md:col-span-1 flex flex-col transition-opacity duration-300 ${!currentClassId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
                Instrumento / Especialidad
              </label>
              <select 
                name="instrument" 
                disabled={isLoadingData || !currentClassId}
                className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-400 outline-none transition-all mt-auto text-slate-900 disabled:opacity-50"
                required={role === "docente"}
              >
                {filteredInstruments.length > 0 ? (
                  <>
                    <option value="">Seleccionar...</option>
                    {filteredInstruments.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </>
                ) : (
                  <option value="">{currentClassId ? "No hay instrumentos disponibles" : "Elegí una clase primero"}</option>
                )}
              </select>
            </div>
          )}
          
          <div className={`md:col-span-1 flex flex-col transition-opacity duration-300 ${!currentClassId ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
              {role === "alumno" ? "Nivel previo" : "Años de experiencia"}
            </label>
            <select name="level" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-400 outline-none transition-all mt-auto text-slate-900">
              {role === "alumno" ? (
                <>
                  <option>Principiante</option>
                  <option>Intermedio</option>
                  <option>Avanzado</option>
                </>
              ) : (
                <>
                  <option>1 a 3 años</option>
                  <option>Más de 5 años</option>
                  <option>Docente con título</option>
                </>
              )}
            </select>
          </div>
        </>
      )}

      {/* CONSULTA GENERAL */}
      {type === "contacto" && (
        <div className="md:col-span-2 flex flex-col">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
            Tu consulta
          </label>
          <textarea name="message" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-400 outline-none transition-all h-32 mt-auto text-slate-900" placeholder="¿En qué podemos ayudarte?" required></textarea>
        </div>
      )}

      {/* BOTÓN DE ENVÍO */}
      <div className="md:col-span-2">
        <button 
          type="submit" 
          disabled={isPending || (type === "clases" && !currentClassId)}
          className={`w-full text-white font-black uppercase tracking-tighter py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 ${
            (isPending || (type === "clases" && !currentClassId))
              ? "bg-slate-300 cursor-not-allowed" 
              : (role === "docente" && type === "clases" ? "bg-orange-500 hover:bg-orange-600 shadow-orange-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100")
          }`}
        >
          {isPending ? "Enviando..." : (type === "contacto" ? "Enviar Mensaje" : role === "alumno" ? "Solicitar Vacante" : "Enviar Postulación")}
        </button>
      </div>
    </form>
  );
}
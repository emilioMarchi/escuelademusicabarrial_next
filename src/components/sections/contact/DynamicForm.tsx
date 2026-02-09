"use client";

import React, { useState } from "react";
import { submitForm } from "@/actions/form-actions";
import { ContactSubmission, EnrollmentSubmission } from "@/types";

export default function DynamicForm({ type }: { type: string }) {
  // Tipamos el estado para que solo acepte los valores válidos
  const [role, setRole] = useState<"estudiante" | "docente">("estudiante");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    let finalData: ContactSubmission | EnrollmentSubmission;

    if (type === "clases") {
      finalData = {
        type: "clases",
        role: role, // Ahora coincide perfectamente con el tipo
        fullname: formData.get("fullname") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string || "",
        instrument: formData.get("instrument") as string,
        level_or_experience: formData.get("level") as string,
        created_at: null, 
        status: "pendiente",
      };
    } else {
      finalData = {
        type: "contacto",
        fullname: formData.get("fullname") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string || "",
        message: formData.get("message") as string,
        created_at: null,
        status: "nuevo",
      };
    }

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
        <h3 className="text-3xl font-black text-green-600 tracking-tighter">¡Todo listo!</h3>
        <p className="text-slate-500 mt-3 font-medium px-4">
          Ya recibimos tu información. Nos pondremos en contacto con vos lo antes posible.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 transition-colors underline decoration-2 underline-offset-4"
        >
          Enviar otro formulario
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      <div className="md:col-span-1 flex flex-col">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
          Nombre Completo
        </label>
        <input name="fullname" type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-400 outline-none transition-all mt-auto" placeholder="Ej: Juan Pérez" required />
      </div>

      <div className="md:col-span-1 flex flex-col">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
          Correo Electrónico
        </label>
        <input name="email" type="email" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-400 outline-none transition-all mt-auto" placeholder="Ej: hola@tuemail.com" required />
      </div>

      <div className="md:col-span-2 flex flex-col">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
          Teléfono (Opcional)
        </label>
        <input name="phone" type="tel" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-400 outline-none transition-all mt-auto" placeholder="Ej: +54 9 11 1234 5678" />
      </div>

      {type === "clases" && (
        <div className="md:col-span-2 flex gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole("estudiante")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${
              role === "estudiante" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 opacity-60"
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

      {type === "clases" && (
        <>
          <div className="md:col-span-1 flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
              Instrumento / Especialidad
            </label>
            <select name="instrument" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-green-400 outline-none transition-all mt-auto">
              <option>Guitarra</option>
              <option>Percusión</option>
              <option>Vientos</option>
              <option>Canto</option>
            </select>
          </div>
          
          <div className="md:col-span-1 flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
              {role === "estudiante" ? "Nivel previo" : "Años de experiencia"}
            </label>
            <select name="level" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-green-400 outline-none transition-all mt-auto">
              {role === "estudiante" ? (
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

      {type === "contacto" && (
        <div className="md:col-span-2 flex flex-col">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block min-h-[1.25rem]">
            Tu consulta
          </label>
          <textarea name="message" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl focus:border-orange-400 outline-none transition-all h-32 mt-auto" placeholder="¿En qué podemos ayudarte?" required></textarea>
        </div>
      )}

      <div className="md:col-span-2">
        <button 
          type="submit" 
          disabled={isPending}
          className={`w-full text-white font-black uppercase tracking-tighter py-5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 ${
            isPending 
              ? "bg-slate-300 cursor-not-allowed" 
              : (role === "docente" && type === "clases" ? "bg-orange-500 hover:bg-orange-600 shadow-orange-100" : "bg-green-600 hover:bg-green-700 shadow-green-100")
          }`}
        >
          {isPending ? "Enviando..." : (type === "contacto" ? "Enviar Mensaje" : role === "estudiante" ? "Solicitar Vacante" : "Enviar Postulación")}
        </button>
      </div>
    </form>
  );
}
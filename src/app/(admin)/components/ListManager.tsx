"use client";
import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  title: string;
  list: string[];
  onUpdate: (newList: string[]) => Promise<void>;
  onClose: () => void;
}

export default function ListManager({ title, list, onUpdate, onClose }: Props) {
  const [newItem, setNewItem] = useState("");

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await onUpdate([...list, newItem.trim()]);
    setNewItem("");
  };

  const handleRemove = async (index: number) => {
    const newList = list.filter((_, i) => i !== index);
    await onUpdate(newList);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X size={18}/></button>

        <h3 className="text-xl font-black uppercase text-slate-900 mb-8 tracking-tighter">{title}</h3>

        <div className="flex gap-2 mb-8">
          <input 
            value={newItem} 
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Escribir nombre..." 
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 outline-none focus:border-green-500 transition-all text-sm"
          />
          <button onClick={handleAdd} className="bg-green-600 text-white p-4 rounded-2xl hover:bg-green-700 shadow-lg shadow-green-900/20 active:scale-95 transition-all">
            <Plus size={24}/>
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {list.length === 0 && <p className="text-center text-slate-400 text-[10px] font-bold uppercase py-10">Sin elementos cargados</p>}
          {list.map((item, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-slate-200 transition-all">
              <span className="text-sm font-bold text-slate-700">{item}</span>
              <button onClick={() => handleRemove(i)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
// src/components/CardItem/CardItem.tsx
import Link from "next/link";
import { UniversalCardData } from "@/types";

interface Props {
  data: UniversalCardData;
  basePath: string;
}

export default function CardItem({ data, basePath }: Props) {
  // Mapeo de colores para representar diversidad
  const colors = {
    green: "border-green-500 bg-green-50 text-green-700 shadow-green-100",
    orange: "border-orange-500 bg-orange-50 text-orange-700 shadow-orange-100",
    purple: "border-purple-500 bg-purple-50 text-purple-700 shadow-purple-100",
    blue: "border-blue-500 bg-blue-50 text-blue-700 shadow-blue-100",
    yellow: "border-yellow-500 bg-yellow-50 text-yellow-700 shadow-yellow-100",
  };

  const colorStyle = data.color ? colors[data.color] : colors.green;

  return (
    <div className={`min-w-[300px] md:min-w-[340px] p-8 rounded-[2.5rem] border-2 transition-all hover:-translate-y-2 ${colorStyle}`}>
      {data.label && (
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3 block">
          {data.label}
        </span>
      )}
      
      <h3 className="text-2xl font-black mb-3 leading-[1.1] text-slate-900">
        {data.title}
      </h3>
      
      <p className="text-sm font-medium opacity-80 mb-8 line-clamp-2 leading-relaxed">
        {data.description}
      </p>

      <Link 
        href={`${basePath}/${data.slug}`} 
        className="inline-flex items-center font-black text-xs uppercase tracking-tighter group"
      >
        <span className="border-b-2 border-current pb-0.5">Saber más</span>
        <span className="ml-2 text-lg transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
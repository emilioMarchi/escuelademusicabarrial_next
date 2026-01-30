// src/components/sections/DynamicSection/DynamicSection.tsx
import CardItem from "@/components/CardItem/CardItem";
import { UniversalCardData } from "@/types";

interface Props {
  title: string;
  items: UniversalCardData[];
  layout: "slider" | "grid";
  basePath: string;
}

export default function DynamicSection({ title, items, layout, basePath }: Props) {
  return (
    <section className="py-16 px-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="mb-12 relative">
          <h2 className="text-4xl font-black text-slate-900">{title}</h2>
          <div className="h-2 w-20 bg-orange-400 mt-2 rounded-full"></div>
        </div>
        
        {layout === "slider" ? (
          <div className="flex overflow-x-auto gap-6 pb-10 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {items.map((item) => (
              <div key={item.id} className="snap-center">
                <CardItem data={item} basePath={basePath} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <CardItem key={item.id} data={item} basePath={basePath} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
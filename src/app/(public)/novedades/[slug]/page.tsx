import { getCollectionAdmin } from "@/services/admin-services";
import Contact from "@/components/sections/contact/Contact";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: news } = await getCollectionAdmin("noticias");
  const newsItem = news?.find((n: any) => n.slug === slug);

  if (!newsItem) return { title: "Noticia no encontrada" };

  return {
    title: `${newsItem.title} | Novedades`,
    description: newsItem.excerpt || newsItem.description?.substring(0, 160),
    openGraph: {
      title: newsItem.title,
      description: newsItem.excerpt || newsItem.description?.substring(0, 160),
      url: `https://escuelademusicabarrial.ar/novedades/${slug}`,
      images: [
        {
          url: "/favicon.png", // Forzamos el favicon como miniatura
          width: 1200,
          height: 630,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: "summary",
      images: ["/favicon.png"],
    }
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: news } = await getCollectionAdmin("noticias");
  const newsItem = news?.find((n: any) => n.slug === slug);

  if (!newsItem) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest text-sm">Noticia no encontrada</div>;

  const pubDate = new Date(newsItem.date);
  const dateString = pubDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <article className="w-full bg-white">
      <nav className="w-full pt-8 pb-4 px-6 md:px-16 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/noticias" className="flex items-center gap-2 text-slate-400 hover:text-orange-600 transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Novedades</span>
        </Link>
        <button className="text-slate-300 hover:text-slate-600 transition-colors">
          <Share2 size={18} />
        </button>
      </nav>

      <section className="w-full px-6 md:px-16 pb-20 lg:max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 items-start">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <header className="mb-8">
              <div className="flex items-center gap-3 text-orange-500 font-bold text-[10px] mb-3 uppercase tracking-widest">
                <Calendar size={12} />
                <span>{dateString}</span>
                <span className="text-slate-200">|</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-slate-900 leading-[1.05] mb-3">
                {newsItem.title}
              </h1>
              {newsItem.excerpt && (
                <p className="text-lg md:text-xl text-slate-500 font-medium leading-tight italic font-serif border-l-2 border-orange-100 pl-4">
                  {newsItem.excerpt}
                </p>
              )}
            </header>

            <div className="prose prose-slate prose-xl max-w-none text-slate-700 leading-relaxed first-letter:text-7xl first-letter:font-black first-letter:text-slate-900 first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8]">
              <div className="whitespace-pre-line font-serif selection:bg-orange-100">
                {newsItem.description}
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">M</div>
              <p className="text-sm font-bold text-slate-800 font-serif">Redacción La Escuela</p>
            </div>
          </div>

          {newsItem.image_url && (
            <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-8">
              <div className="relative">
                <img 
                  src={newsItem.image_url} 
                  className="w-full h-auto aspect-[4/5] lg:aspect-square object-cover rounded-[2.5rem] shadow-2xl shadow-slate-200" 
                  alt={newsItem.title} 
                />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-50 rounded-full -z-10 blur-2xl opacity-60"></div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Contact 
        category="contacto" 
        hasForm={true} 
        customTitle="Participá en la comunidad"
        customDescription="Suscribite a nuestro newsletter o escribinos si tenés alguna propuesta."
      />
    </article>
  );
}
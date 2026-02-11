// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { getCollectionAdmin } from '@/services/admin-services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 1. Rutas Estáticas
  const staticRoutes = [
    '',
    '/clases',
    '/novedades',
    '/galeria',
    '/como-ayudar',
    '/contacto',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }));

  // 2. Rutas Dinámicas (Clases)
  const { data: classes } = await getCollectionAdmin("clases");
  const classRoutes = (classes || []).map((item: any) => ({
    url: `${baseUrl}/clases/${item.slug}`,
    lastModified: new Date(item.last_updated || new Date()),
    priority: 0.8,
  }));

  // 3. Rutas Dinámicas (Noticias)
  const { data: news } = await getCollectionAdmin("noticias");
  const newsRoutes = (news || []).map((item: any) => ({
    url: `${baseUrl}/novedades/${item.slug}`,
    lastModified: new Date(item.date || new Date()),
    priority: 0.6,
  }));

  return [...staticRoutes, ...classRoutes, ...newsRoutes];
}
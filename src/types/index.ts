// src/types/index.ts

export type CategoryType = 'inicio' | 'nosotros' | 'clases' | 'noticias' | 'donaciones' | 'contacto';
export type PaymentType = 'one-time' | 'monthly';
export type OrderStatus = 'pending' | 'approved' | 'rejected';
export type SectionType = 'hero' | 'clases' | 'noticias' | 'contacto' | 'donaciones' | 'texto-bloque' | 'donacion-exitosa';

export interface Donation {
  id?: string;
  amount: number;
  email: string;
  name: string;
  type: PaymentType; 
  status: OrderStatus;
  payment_id?: string;
  external_reference?: string;
  created_at: any;
}

export interface PageContent {
  id: string;
  slug: string;
  category: CategoryType;
  header_title: string;
  header_description: string;
  header_image_url: string;
  header_image_alt: string;
  sections: (string | SectionData)[];
  meta_title: string;
  meta_description: string;
  has_form: boolean;
  last_updated: any;
}

export interface SectionData {
  id: string;
  type: SectionType;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    image_url?: string;
    slides?: any[];
  };
  settings?: {
    layout?: string;
    form_type?: 'general' | 'inscripcion';
    default_amount?: number;
  };
}

export interface Class {
  id: string;
  name: string;
  teacher_name: string;
  schedule: string;
  description: string;
  instrument: string;
  image_url: string;
  image_alt: string;
  max_capacity: number;
  is_active: boolean;
  category: 'clases';
}

export interface News {
  id: string;
  title: string;
  description: string;
  date: string;
  image_url?: string;
  is_active: boolean;
  category: 'noticias';
  gallery?: string[];
}

export interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  category?: string;
  created_at: any;
  order?: number;
}
// src/types/index.ts

export type PaymentType = 'one-time' | 'monthly';
export type OrderStatus = 'pending' | 'approved' | 'rejected';
export type CategoryType = 'inicio' | 'nosotros' | 'clases' | 'noticias' | 'donaciones' | 'contacto';
export type SectionType = 'hero' | 'clases' | 'noticias' | 'contacto' | 'donaciones' | 'texto-bloque';

export interface SlideButton {
  text: string;
  link: string;
  style: string; // 'solid' | 'outline' normalmente, pero string es más seguro por ahora
}

export interface Slide {
  title?: string;
  description?: string;
  image_url: string;
  buttons?: SlideButton[];
}

// Acá es donde ajustamos para que acepte TODO lo que viene de Firebase
export interface SectionContent {
  title?: string;
  subtitle?: string;    // Agregamos esto para compatibilidad
  description?: string;
  image_url?: string;
  slides?: Slide[];     // Array de slides
  form_type?: string;   // Para contacto
  [key: string]: any;   // Comodín para evitar que se rompa si hay campos extra
}

export interface SectionData {
  id: string;
  type: string; // 'hero' | 'clases' | etc.
  content: SectionContent;
  settings?: Record<string, any>;
}

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


export interface ContactSubmission {
  type: "contacto";
  fullname: string;
  email: string;
  phone: string;
  message: string;
  status: "nuevo" | "visto" | "respondido"; // Agregado
  created_at: any; // Agregado
}

export interface EnrollmentSubmission {
  type: "clases";
  fullname: string;
  email: string;
  phone: string;
  instrument: string;
  level_or_experience: string; // Agregado (lo que viene del select)
  role: "estudiante" | "docente"; // Cambiado a 'estudiante' para coincidir con el form
  status: "pendiente" | "aceptado" | "rechazado"; // Agregado
  created_at: any; // Agregado
}

export type FormSubmission = ContactSubmission | EnrollmentSubmission;

export interface UniversalCardData {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  image_url?: string;
  label?: string;
  color?: "green" | "orange" | "purple" | "blue" | "yellow"; 
  name?: string;         
  excerpt?: string;      
  // Campos dinámicos de la DB
  date?: string;         
  schedule?: string;     
  teacher_name?: string; 
  max_capacity?: number; 
}
export interface PageWithSections extends PageContent {
  renderedSections: SectionData[];
}


export interface GalleryVideo {
  id: string;
  url: string; // URL de Storage o link de YouTube
  type: 'file' | 'link';
  title: string;
  description?: string;
  created_at: any;
  order: number;
}
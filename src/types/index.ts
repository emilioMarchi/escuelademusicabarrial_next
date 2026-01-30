// src/types/index.ts

export type CategoryType = 'inicio' | 'nosotros' | 'clases' | 'noticias' | 'donaciones' | 'contacto';
export type PaymentType = 'one-time' | 'monthly'; // Donación única o suscripción mensual
export type OrderStatus = 'pending' | 'approved' | 'rejected';

export interface PageContent {
  id: string;
  slug: string;             // La URL (ej: /clases)
  category: CategoryType;   // El identificador de grupo (ej: 'clases')
  header_title: string;
  header_description: string;
  header_image_url: string;
  header_image_alt: string;
  sections: string[];       
  meta_title: string;
  meta_description: string;
  has_form: boolean;
  last_updated: any;
}

export interface Class {
  id: string;
  category: 'clases';       // Vinculación directa
  name: string;
  teacher_name: string;
  schedule: string;
  description: string;
  instrument: string;
  image_url: string;
  image_alt: string;
  max_capacity: number;
  is_active: boolean;
}

export interface PaymentOrder {
  id: string;
  payment_type: PaymentType; // Distingue entre donación simple o mensual
  status: OrderStatus;
  amount: number;
  user_email: string;
  concept: string;          
  mp_preference_id: string; // ID de la transacción en Mercado Pago
  created_at: any;
}
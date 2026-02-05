// src/lib/mercadopago.ts
import axios from "axios";

const MP_ACCESS_TOKEN = process.env.ACCESS_TOKEN_MP;

/**
 * Crea una preferencia de pago único (Checkout Pro)
 */
export const createMPPreference = async (data: { 
  name: string; 
  email: string; 
  amount: number;
  external_reference: string; 
}) => {
  const url = "https://api.mercadopago.com/checkout/preferences";
  
  const body = {
    payer: { 
      name: data.name, 
      email: data.email 
    },
    items: [
      {
        title: "Donación de pago único - Escuela de Música Barrial",
        category_id: "donaciones",
        quantity: 1,
        unit_price: data.amount,
        currency_id: "ARS"
      }
    ],
    external_reference: data.external_reference,
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_SITE_URL}/gracias`,
      failure: `${process.env.NEXT_PUBLIC_SITE_URL}/donaciones`,
      pending: `${process.env.NEXT_PUBLIC_SITE_URL}/donaciones`,
    },
    auto_return: "approved",
    // Esta URL ya estaba bien para pagos únicos
    notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
  };

  const response = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`
    }
  });

  return response.data;
};

/**
 * Crea una suscripción mensual (Debito Automático)
 */
export const createMPSubscription = async (data: { 
  name: string; 
  email: string; 
  amount: number;
  external_reference: string; 
}) => {
  const url = "https://api.mercadopago.com/preapproval";

  const body = {
    reason: "Suscripción mensual - Escuela de Música Barrial",
    payer_email: data.email.trim(),
    external_reference: data.external_reference,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: Number(data.amount),
      currency_id: "ARS"
    },
    back_url: `${process.env.NEXT_PUBLIC_SITE_URL}/gracias`,
    // AGREGADO AQUÍ: Notificación para suscripciones
    notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
    status: "pending" 
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`
      }
    });
    return response.data;
  } catch (error: any) {
    console.error("MP SUBSCRIPTION ERROR DETAILS:", error.response?.data);
    throw error;
  }
};
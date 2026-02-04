// src/lib/mercadopago.ts
import axios from "axios";

const MP_ACCESS_TOKEN = process.env.ACCESS_TOKEN_MP;

export const createMPPreference = async (data: { name: string; email: string; amount: number }) => {
  const url = "https://api.mercadopago.com/checkout/preferences";
  
  const body = {
    payer: { name: data.name, email: data.email },
    items: [
      {
        title: "Donación de pago único - Escuela de Música Barrial",
        category_id: "donaciones",
        quantity: 1,
        unit_price: data.amount,
        currency_id: "ARS"
      }
    ],
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_SITE_URL}/gracias`,
      failure: `${process.env.NEXT_PUBLIC_SITE_URL}/donaciones`,
      pending: `${process.env.NEXT_PUBLIC_SITE_URL}/donaciones`,
    },
    auto_return: "approved",
  };

  const response = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`
    }
  });

  return response.data; // Retorna init_point
};

export const createMPSubscription = async (data: { name: string; email: string; amount: number }) => {
  const url = "https://api.mercadopago.com/preapproval";

  const body = {
    reason: "Suscripción mensual - Escuela de Música Barrial",
    payer_email: data.email,
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: data.amount,
      currency_id: "ARS"
    },
    back_url: `${process.env.NEXT_PUBLIC_URL}/gracias`,
    status: "authorized"
  };

  const response = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`
    }
  });

  return response.data; // Retorna init_point
};
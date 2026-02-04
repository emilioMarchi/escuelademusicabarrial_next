// src/app/api/payments/route.ts
import { NextResponse } from "next/server";
import { createMPPreference, createMPSubscription } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, email, amount } = body;

    let result;
    if (type === "subscription") {
      result = await createMPSubscription({ name, email, amount });
    } else {
      result = await createMPPreference({ name, email, amount });
    }

    return NextResponse.json({ init_point: result.init_point || result.sandbox_init_point });
  } catch (error: any) {
    console.error("MP Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Error al procesar el pago" }, { status: 400 });
  }
}
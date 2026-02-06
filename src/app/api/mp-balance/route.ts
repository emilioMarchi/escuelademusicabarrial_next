import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  const token = process.env.ACCESS_TOKEN_MP;

  try {
    // 1. Probamos primero el endpoint de "Mí usuario" para ver si el token funciona
    const userRes = await axios.get("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const userId = userRes.data.id;
    console.log("✅ Token válido. User ID:", userId);

    // 2. Intentamos obtener el balance usando el ID específico del usuario
    // Esta es la ruta más robusta en 2026
    const balanceUrl = `https://api.mercadopago.com/users/${userId}/mercadopago_account/balance`;
    
    const balanceRes = await axios.get(balanceUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // 🔍 LOG CLAVE: Esto se verá en tu terminal de VS Code
    console.log("===== DATA BRUTA DE MP =====");
    console.log(JSON.stringify(balanceRes.data, null, 2));
    
    return NextResponse.json({
      available_balance: balanceRes.data.available_balance || 0,
      unavailable_balance: balanceRes.data.unavailable_balance || 0,
      total_amount: balanceRes.data.total_amount || 0
    });

  } catch (error: any) {
    // Si MP responde con error, imprimimos TODO el cuerpo del error
    console.error("❌ ERROR DETALLADO DE MP:");
    console.error(error.response?.data || error.message);
    
    return NextResponse.json({ 
      error: "Error en MP", 
      details: error.response?.data 
    }, { status: error.response?.status || 500 });
  }
}
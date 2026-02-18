"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User,
  getIdToken
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      // Simplemente actualizamos el estado del usuario del SDK de cliente.
      // La verificación real de admin se hace en el backend al crear la cookie.
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await getIdToken(userCredential.user);

      // Llamar a nuestra API para crear la cookie de sesión en el servidor.
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Si la API deniega el acceso (ej: no es admin), deslogueamos al usuario
        // del cliente también y mostramos el error.
        await signOut(auth);
        alert(errorData.error || "Error al iniciar sesión como administrador.");
        throw new Error(errorData.error || "Error en el servidor de autenticación");
      }
      // Si todo va bien, el usuario está logueado en cliente y servidor.
      // El `onAuthStateChanged` ya habrá actualizado el estado `user`.
    } catch (error) {
      console.error("Auth error:", error);
      // Nos aseguramos de que el usuario esté deslogueado si algo falla.
      await signOut(auth);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Llamar a la API para que borre la cookie de sesión del servidor.
      await fetch('/api/auth/logout', { method: 'POST' });
      // Desloguear del SDK de cliente de Firebase.
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    loading,
    loginWithGoogle,
    logout
  }), [user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
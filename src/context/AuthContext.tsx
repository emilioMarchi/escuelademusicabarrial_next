"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * 1. Lista blanca de correos autorizados.
 * Solo los emails incluidos aquí podrán mantener la sesión activa en el dashboard.
 */
const ADMIN_EMAILS = ["emiliomarchi.dev@gmail.com"]; 

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
    // Escucha los cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Se valida si el correo electrónico está en la lista de administradores permitidos
        if (ADMIN_EMAILS.includes(currentUser.email || "")) {
          setUser(currentUser);
        } else {
          // Si el usuario no está autorizado, se cierra la sesión inmediatamente
          await signOut(auth);
          setUser(null);
          alert("Acceso denegado: Este correo no tiene permisos de administrador.");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /**
   * Se memoriza el valor del contexto para optimizar el rendimiento y 
   * asegurar la compatibilidad con el tipo AuthContextType.
   */
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
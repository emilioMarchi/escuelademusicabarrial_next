"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User 
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
      if (currentUser) {
        try {
          // Consultamos la lista de emails permitidos en Firestore
          const adminDoc = await getDoc(doc(db, "settings", "admins"));
          const allowedEmails = adminDoc.data()?.emails || [];

          // Si la lista está vacía, podrías permitir el primer acceso o dejar un fallback
          if (allowedEmails.includes(currentUser.email || "")) {
            setUser(currentUser);
          } else {
            await signOut(auth);
            setUser(null);
            alert("Acceso denegado: Este correo no tiene permisos de administrador.");
          }
        } catch (error) {
          console.error("Error verificando permisos:", error);
          setUser(null);
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
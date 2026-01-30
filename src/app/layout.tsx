import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadatos base para SEO según el Blueprint
export const metadata: Metadata = {
  title: {
    template: "%s | Escuela de Música Barrial",
    default: "Escuela de Música Barrial - Educación Musical Comunitaria",
  },
  description: "Sitio oficial de la Escuela de Música Barrial. Clases, talleres y cultura para la comunidad.",
  keywords: ["música", "escuela barrial", "clases de música", "talleres musicales"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Aquí es donde luego envolverás el children con el 
            AuthProvider de Firebase cuando configuremos la seguridad
        */}
        {children}
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; 
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.escuelademusicabarrial.ar'),
  alternates: {
    canonical: './', 
  },
  title: {
    template: "%s | Escuela de Música Barrial",
    default: "Escuela de Música Barrial",
  },
  description: "Espacio de formación, contención y arte en el corazón del barrio.",
  
  // AGREGADO: Configuración base para redes sociales y Google Discover
  openGraph: {
    title: "Escuela de Música Barrial",
    description: "Espacio de formación, contención y arte en el corazón del barrio.",
    url: 'https://www.escuelademusicabarrial.ar',
    siteName: 'Escuela de Música Barrial',
    locale: 'es_AR',
    type: 'website',
  },
 
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' }, // Para Android y Chrome
    ],
    apple: [
      { url: '/favicon.png', sizes: '180x180', type: 'image/png' }, // Para iPhone
    ],
  },
  // -----------------------------------------------------------
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
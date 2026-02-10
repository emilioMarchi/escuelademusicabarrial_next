import React from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { fetchGeneralSettings } from "@/services/settings-services";
import { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://escuelademusicabarrial.ar"),
  title: {
    // El %s es donde se meterá el título de las páginas internas
    template: "%s | Escuela de Música Barrial",
    default: "Escuela de Música Barrial",
  },
  // FAVICON PERMANENTE
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await fetchGeneralSettings();
  const safeSettings = settings ? JSON.parse(JSON.stringify(settings)) : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="w-full flex-grow">
        {children}
      </main>
      <Footer data={safeSettings || {}} />
    </div>
  );
}
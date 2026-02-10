import React from "react";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { fetchGeneralSettings } from "@/services/settings-services";

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
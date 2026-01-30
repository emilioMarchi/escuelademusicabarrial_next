// src/app/(admin)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">EMB Admin</h2>
        <nav className="space-y-4">
          <p className="text-gray-400 text-xs uppercase">Gestión</p>
          <div className="block text-sm">Contenido (Páginas)</div>
          <div className="block text-sm">Clases e Inscripciones</div>
          <div className="block text-sm">Donaciones</div>
        </nav>
      </aside>
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
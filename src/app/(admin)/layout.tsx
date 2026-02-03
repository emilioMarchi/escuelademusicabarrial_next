import Sidebar from "./components/Sidebar";
import { DirtyStateProvider } from "@/context/DirtyStateContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DirtyStateProvider>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto">
          <div className="p-8 md:p-12 max-w-6xl mx-auto pb-32">
            {children}
          </div>
        </main>
      </div>
    </DirtyStateProvider>
  );
}
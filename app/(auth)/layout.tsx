import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 rounded-full blur-[120px] animate-pulse transition-all duration-1000" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex justify-center translate-x-[-10px]">
           <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-white hover:border-indigo-200 transition-all duration-300 font-medium text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </div>
    </div>
  );
}

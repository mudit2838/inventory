import React from "react";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

export const LandingNavbar = () => {
  return (
    <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
      <Link href="/" className="flex items-center gap-2 group cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
          <PackageOpen className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Inventory
        </span>
      </Link>
      
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <Link href="/features" className="hover:text-white transition-colors hover:scale-105 transform">Features</Link>
        <Link href="/how-it-works" className="hover:text-white transition-colors hover:scale-105 transform">How it Works</Link>
        <Link href="/testimonials" className="hover:text-white transition-colors hover:scale-105 transform">Testimonials</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link 
          href="/login" 
          className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link 
          href="/register" 
          className="text-sm font-medium px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-200 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

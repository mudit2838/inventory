import React from "react";
import { PackageOpen } from "lucide-react";

export const LandingFooter = () => {
  return (
    <footer className="border-t border-white/5 mt-12 relative z-10">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <PackageOpen className="w-5 h-5 text-indigo-400" />
          <span className="font-semibold tracking-tight text-slate-300">Inventory</span>
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Inventory. All rights reserved. Built for production.
        </p>
      </div>
    </footer>
  );
};

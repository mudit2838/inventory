import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingBackground } from "@/components/landing/LandingBackground";
import {
  BarChart3,
  Zap,
  Users,
  ShieldCheck,
  Smartphone,
  Globe,
  Scale,
  History,
  LayoutDashboard,
  Fingerprint,
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      title: "Real-time Analytics",
      description: "Monitor your business health with live data streaming and beautiful interactive charts.",
      icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
      color: "indigo"
    },
    {
      title: "Lightning Fast POS",
      description: "Process transactions in milliseconds with our optimized checkout engine.",
      icon: <Zap className="w-6 h-6 text-fuchsia-400" />,
      color: "fuchsia"
    },
    {
      title: "Customer CRM",
      description: "Build deep relationships with integrated loyalty tracking and purchase history.",
      icon: <Users className="w-6 h-6 text-rose-400" />,
      color: "rose"
    },
    {
      title: "Scale at Speed",
      description: "Infrastructure built to handle millions of items and complex inventory trees.",
      icon: <Scale className="w-6 h-6 text-blue-400" />,
      color: "blue"
    },
    {
      title: "History & Audits",
      description: "Every change is logged. Track stock movements and sales history with perfection.",
      icon: <History className="w-6 h-6 text-emerald-400" />,
      color: "emerald"
    },
    {
      title: "Inventory Master",
      description: "Automated low-stock alerts and advanced tracking for every product variation.",
      icon: <LayoutDashboard className="w-6 h-6 text-amber-400" />,
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative selection:bg-indigo-500/30">
      <LandingBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingNavbar />

        <main className="flex-1 container mx-auto px-6 py-20">
          {/* Hero Section of Features */}
          <div className="max-w-4xl mx-auto text-center mb-32">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              Built for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400">Excellence.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-light">
              Experience a suite of features engineered for the modern enterprise. Fast, secure, and beautiful.
            </p>
          </div>

          {/* Features Grid - Redesigned for more premium feel */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-40">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500"
              >
                {/* Accent Blob */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${feature.color}-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:translate-x-1 transition-transform">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Feature Highlight: Security - Big Bento Box Style */}
          <div className="relative rounded-[4rem] bg-slate-900/50 border border-white/5 p-8 md:p-20 overflow-hidden backdrop-blur-xl">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent"></div>
             
             <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-10">
                   <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold tracking-wide uppercase">
                     <ShieldCheck className="w-4 h-4" /> Military Grade Security
                   </div>
                   
                   <h2 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tighter">
                     Your data, <br />
                     <span className="text-slate-400 font-medium">uncompromised.</span>
                   </h2>
                   
                   <p className="text-lg text-slate-400 leading-relaxed max-w-md italic">
                     "The security architecture of Inventory gives us the confidence to scale across 12 countries without losing sleep."
                   </p>
                   
                   <div className="grid sm:grid-cols-2 gap-8">
                      <div className="flex items-center gap-4 group">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform"></div>
                         <span className="font-semibold text-slate-200">256-bit Encryption</span>
                      </div>
                      <div className="flex items-center gap-4 group">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:scale-150 transition-transform"></div>
                         <span className="font-semibold text-slate-200">Multi-factor Auth</span>
                      </div>
                      <div className="flex items-center gap-4 group">
                         <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 group-hover:scale-150 transition-transform"></div>
                         <span className="font-semibold text-slate-200">Daily Snapshots</span>
                      </div>
                      <div className="flex items-center gap-4 group">
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:scale-150 transition-transform"></div>
                         <span className="font-semibold text-slate-200">Role Isolation</span>
                      </div>
                   </div>
                </div>

                <div className="relative aspect-square flex items-center justify-center">
                   <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-rose-500/20 rounded-full blur-[100px] animate-pulse"></div>
                   <div className="w-full h-full max-w-sm rounded-[3rem] bg-slate-950/80 border border-white/10 p-4 relative group shadow-2xl">
                      <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center gap-8 overflow-hidden">
                         <Fingerprint className="w-32 h-32 text-indigo-500 group-hover:scale-110 transition-transform duration-700" />
                         <div className="space-y-3 w-full px-12">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full w-2/3 bg-indigo-500 animate-pulse"></div>
                            </div>
                            <div className="h-2 w-3/4 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full w-1/2 bg-indigo-500 animate-pulse delay-500"></div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}

import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingBackground } from "@/components/landing/LandingBackground";
import {
  UserPlus,
  Settings,
  ShoppingCart,
  LineChart,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Create your workspace",
      description: "Sign up in seconds and name your business. We'll set up your secure environment instantly.",
      icon: <UserPlus className="w-8 h-8" />,
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Setup Inventory",
      description: "Import products or add them manually with SKUs, prices, and stock levels. Organize by category.",
      icon: <Settings className="w-8 h-8" />,
      color: "from-blue-500 to-emerald-500"
    },
    {
      title: "Start Selling",
      description: "Use our lightning-fast POS to record sales. Invoices are generated automatically for every order.",
      icon: <ShoppingCart className="w-8 h-8" />,
      color: "from-emerald-500 to-amber-500"
    },
    {
      title: "Scale & Analyze",
      description: "Monitor sales trends in real-time. Use deep insights to optimize stock and grow revenue.",
      icon: <LineChart className="w-8 h-8" />,
      color: "from-amber-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative">
      <LandingBackground />
      <div className="relative z-10">
        <LandingNavbar />

        <main className="container mx-auto px-6 pt-24 pb-32">
          {/* Header */}
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Simplicity <span className="italic text-slate-400">reimagined</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Experience a workflow designed for flow. From setup to scale, Inventory handles the complexity so you can focus on building.
            </p>
          </div>

          {/* Interactive Timeline */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-[60px] left-[5%] right-[5%] h-px bg-gradient-to-r from-indigo-500/0 via-slate-700 to-rose-500/0"></div>

            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center group">
                {/* Step Number/Icon Card */}
                <div className={`w-28 h-28 rounded-[2.5rem] bg-gradient-to-br ${step.color} p-px mb-8 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl`}>
                  <div className="w-full h-full bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center font-black text-lg border-4 border-slate-950">
                    {index + 1}
                  </div>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-indigo-300 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] mx-auto">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Quote/Moment */}
          <div className="mt-40 max-w-5xl mx-auto rounded-[3.5rem] bg-white/[0.03] border border-white/10 p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-8 animate-pulse" />
            <h2 className="text-3xl md:text-5xl font-bold mb-10 leading-snug">
              "We cut our checkout time <br className="hidden md:block" /> by <span className="text-emerald-400">65%</span> in the first month."
            </h2>
            <p className="text-slate-400 text-lg mb-12 italic">
              — Maria Gonzalez, CEO of RetailFlow
            </p>
            <button className="px-10 py-5 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-200 transition-all flex items-center gap-2 mx-auto shadow-xl hover:shadow-white/10 group">
              Try it yourself <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}

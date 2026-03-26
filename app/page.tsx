import Link from "next/link";
import { ChevronRight, BarChart3, Zap, Users, ShieldCheck, Fingerprint } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingBackground } from "@/components/landing/LandingBackground";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative selection:bg-indigo-500/30">
      <LandingBackground />

      <div className="relative z-10">
        <LandingNavbar />

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-float">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-300">Inventory Next-Gen 2.0 is Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-8">
            Manage your inventory with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400 animate-gradient bg-[length:200%_auto]">
              absolute precision
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience the most sublime, lightning-fast inventory and POS system built for modern businesses. Scale operations effortlessly with real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Start for Free
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 backdrop-blur-md transition-all duration-300"
            >
              View Live Demo
            </Link>
          </div>

          {/* Hero Image Mockup (Abstract representation) */}
          <div className="mt-24 w-full max-w-5xl mx-auto relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl p-2 shadow-2xl overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              {/* Fake UI Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="w-48 h-5 rounded-md bg-white/5"></div>
              </div>
              {/* Fake UI Body */}
              <div className="grid grid-cols-4 gap-4 p-6 h-[400px]">
                <div className="col-span-1 space-y-4">
                  <div className="h-20 rounded-xl bg-white/5 flex items-center p-4 gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20"></div>
                    <div className="flex-1 space-y-2"><div className="h-2 bg-white/20 rounded w-1/2"></div><div className="h-2 bg-white/10 rounded w-3/4"></div></div>
                  </div>
                  <div className="h-64 rounded-xl bg-white/5"></div>
                </div>
                <div className="col-span-3 space-y-4">
                  <div className="flex gap-4">
                    <div className="h-24 flex-1 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20"></div>
                    <div className="h-24 flex-1 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-transparent border border-fuchsia-500/20"></div>
                    <div className="h-24 flex-1 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20"></div>
                  </div>
                  <div className="h-56 rounded-xl bg-white/5 border border-white/5 p-6 flex items-end gap-2">
                    <div className="w-full h-[60%] bg-indigo-500/20 rounded-t-sm"></div>
                    <div className="w-full h-[80%] bg-indigo-500/40 rounded-t-sm"></div>
                    <div className="w-full h-[50%] bg-indigo-500/20 rounded-t-sm"></div>
                    <div className="w-full h-[100%] bg-indigo-500/60 rounded-t-sm"></div>
                    <div className="w-full h-[70%] bg-indigo-500/30 rounded-t-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview Section */}
        <section id="features" className="container mx-auto px-6 py-24 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to scale</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">A beautifully cohesive ecosystem merging POS, inventory, and customer relations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors"></div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Watch your revenue grow in real-time. Beautiful charts and instant insights on your best-performing products.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl group-hover:bg-fuchsia-500/30 transition-colors"></div>
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center mb-6 border border-fuchsia-500/30 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast POS</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Process sales at the speed of thought. Auto-complete products, instant invoicing, and seamless checkout flows.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-colors"></div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center mb-6 border border-rose-500/30 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer CRM</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Build lasting relationships. Track credit, purchase history, and manage your entire customer database securely.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden lg:col-span-3">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Enterprise-Grade Security</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                    Your business data is protected by industry-standard encryption, secure session management, and role-based access control. Sleep peacefully knowing your inventory is safe.
                  </p>
                </div>
                <div className="flex-1 w-full bg-slate-900/50 rounded-xl border border-white/5 p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-emerald-400 bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                    <Fingerprint className="w-6 h-6" />
                    <span className="font-medium">End-to-end Encryption</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300 bg-white/5 p-4 rounded-lg border border-white/5 opacity-70">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="font-medium">JWT Secure Sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/features" className="inline-flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors group">
              Explore all features <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="container mx-auto px-6 py-24 border-t border-white/10">
          <div className="rounded-3xl bg-gradient-to-b from-indigo-900/40 to-slate-900 border border-indigo-500/20 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none"></div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your business?</h2>
            <p className="text-slate-300 mb-10 max-w-xl mx-auto relative z-10 text-lg">
              Join thousands of owners who trust Inventory to scale their operations. Setup takes less than 2 minutes.
            </p>
            <Link
              href="/register"
              className="relative z-10 inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              Get Started Now
            </Link>
          </div>
        </section>

        <LandingFooter />
      </div>
    </div>
  );
}

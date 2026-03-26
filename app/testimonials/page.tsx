import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { Star, Quote, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Founder, ShopSphere",
      content: "Inventory has transformed how we manage our stock. The analytics are simply breathtaking and have helped us identify our top margins instantly.",
      avatar: "AR",
      rating: 5,
      color: "indigo"
    },
    {
      name: "Sarah Chen",
      role: "Operations Manager, Urban Goods",
      content: "Lightning fast. That's the only way to describe the POS. Our staff learned it in 5 minutes, and our checkout lines move significantly faster now.",
      avatar: "SC",
      rating: 5,
      color: "emerald"
    },
    {
      name: "James Wilson",
      role: "Owner, Wilson Hardware",
      content: "The support and the security features give me peace of mind. Knowing my data is secure and backed up daily is worth every penny.",
      avatar: "JW",
      rating: 5,
      color: "amber"
    },
    {
      name: "Elena Rodriguez",
      role: "CEO, Luxa Boutique",
      content: "Beautiful interface that actually makes inventory management fun. It feels like a premium tool for a premium brand.",
      avatar: "ER",
      rating: 5,
      color: "fuchsia"
    },
    {
      name: "Marcus Thorne",
      role: "Logistics Lead, Peak Supply",
      content: "The multi-device sync is a literal lifesaver. I can check stock from my phone while in the warehouse and it reflects on our register instantly.",
      avatar: "MT",
      rating: 5,
      color: "blue"
    },
    {
      name: "Linda Wu",
      role: "Boutique Owner",
      content: "I've tried 5 different systems before this one. Inventory is the first one that just works without constant headaches.",
      avatar: "LW",
      rating: 5,
      color: "rose"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden relative">
      <LandingBackground />
      <div className="relative z-10">
        <LandingNavbar />

        <main className="container mx-auto px-6 pt-24 pb-32">
          {/* Header */}
          <div className="text-center mb-24 max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400">founders</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              Don't just take our word for it. Join thousands of businesses scaling their operations with Inventory.
            </p>
          </div>

          {/* FIXED: GRID LAYOUT FOR UNIFORM CARD SIZES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-32 auto-rows-fr items-stretch">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="flex flex-col h-full w-full"
              >
                <div className="p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 group flex flex-col h-full min-h-[450px]">
                  <Quote className="w-12 h-12 text-slate-700 mb-8 group-hover:text-indigo-500/50 transition-colors" />
                  <div className="flex gap-1.5 mb-6">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex-grow">
                    <p className="text-xl text-slate-300 leading-relaxed mb-10 font-light">
                      "{t.content}"
                    </p>
                  </div>
                  <div className="flex items-center gap-5 pt-8 border-t border-white/5 mt-auto">
                    <div className={`w-14 h-14 rounded-full bg-${t.color}-500/20 border border-${t.color}-500/30 flex items-center justify-center font-bold text-lg text-${t.color}-400`}>
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-white">{t.name}</h4>
                      <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-20 border-y border-white/5">
            {[
              { label: "Active Users", value: "10k+" },
              { label: "Countries", value: "45+" },
              { label: "Uptime", value: "99.99%" },
              { label: "Customer Satisfaction", value: "4.9/5" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-black mb-2 text-white">{stat.value}</div>
                <div className="text-sm font-semibold uppercase tracking-widest text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-32 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to be our next success story?</h2>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-black text-xl hover:scale-105 hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all group"
            >
              Get Started Now <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </main>

        <LandingFooter />
      </div>
    </div>
  );
}

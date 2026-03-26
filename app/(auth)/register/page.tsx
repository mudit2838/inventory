"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  User, 
  Briefcase, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  UserPlus, 
  ArrowRight 
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to register");
        setIsLoading(false);
        return;
      }

      toast.success("Welcome aboard! Please sign in.");
      router.push("/login");
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
      <CardHeader className="space-y-3 pt-10 px-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-fuchsia-50 flex items-center justify-center text-fuchsia-600 mb-2">
          <UserPlus className="w-8 h-8" />
        </div>
        <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
          Create Account
        </CardTitle>
        <CardDescription className="text-slate-500 text-base">
          Join the future of inventory management today
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-1">Full Name</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <Input
                id="name"
                placeholder="John Doe"
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-white/50 transition-all"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-semibold text-slate-700 ml-1">Business Name</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <Input
                id="businessName"
                placeholder="Doe General Store"
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-white/50 transition-all"
                value={formData.businessName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">Email Address</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-white/50 transition-all"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">Password</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-500 bg-white/50 transition-all"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-fuchsia-500 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 shadow-lg shadow-indigo-100 text-white font-bold transition-all duration-300 mt-2" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" /> Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Register Workspace <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-6 px-8">
        <div className="text-sm text-slate-600 w-full text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (res?.error) {
        toast.error(res.error === "CredentialsSignin" ? "Invalid email or password" : res.error);
        setIsLoading(false);
      } else {
        toast.success("Welcome back!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
      <CardHeader className="space-y-3 pt-10 px-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">
          Sign In
        </CardTitle>
        <CardDescription className="text-slate-500 text-base">
          Enter your credentials to access your command center
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">Email Address</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@business.com"
                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 ml-1">Password</Label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 rounded-xl border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 text-white font-bold transition-all duration-300" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-6 px-8">
        <div className="text-sm text-slate-600 w-full text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-600 font-bold hover:underline">
            Register for free
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-slate-500 text-sm font-medium">Securing connection...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      if (result.data.session) router.push("/dashboard");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || (mode === "register" && !name)) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (signUpError) throw signUpError;
        router.push("/dashboard");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col md:flex-row bg-gradient-to-b from-[#50C8F8] to-[#9EE0FA]">
      
      {/* 3D background wrapper (Full screen on mobile, 50% width on Desktop) */}
      <div className="absolute inset-0 z-0 pointer-events-auto" />

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-end md:justify-center p-4 pb-8 pointer-events-none">
        
        {/* Title area matching reference image aesthetic */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 md:translate-x-0 md:static md:mb-auto md:mt-12 text-center md:-ml-[400px]">
          <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-md">
            Life OS
          </h1>
          <p className="text-white/90 text-sm mt-1 font-medium drop-shadow">
            Your Premium Second Brain
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[400px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl pointer-events-auto md:ml-auto md:mr-[10%] backdrop-blur-md bg-opacity-95">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-serif" style={{ fontFamily: "cursive, sans-serif" }}>
              {mode === "login" ? "Getting Started" : "Create Account"}
            </h2>
            <p className="text-[13px] text-gray-500 mt-1">
              {mode === "login" ? "Welcome back! Login to continue." : "Let's build your premium workspace."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f0f0f0] border-none rounded-full px-5 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#50C8F8] outline-none transition-all shadow-inner"
                />
              </div>
            )}
            
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f0f0f0] border-none rounded-full px-5 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#50C8F8] outline-none transition-all shadow-inner"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f0f0f0] border-none rounded-full px-5 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#50C8F8] outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <div className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-xl">{error}</div>}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-full py-3.5 text-[15px] font-bold shadow-lg shadow-[#0ea5e9]/30 transition-all flex items-center justify-center gap-2 mt-6 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === "login" ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <div className="text-center mt-6 z-10 relative">
            <span className="text-xs text-gray-500">
              {mode === "login" ? "Forgot your password? " : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-xs font-bold text-[#0ea5e9] hover:text-[#0284c7] transition-colors"
            >
              {mode === "login" ? "Reset Password" : "Sign In"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 hidden md:block">
            <p className="text-xs text-gray-400 text-center mb-4">Or continue with</p>
            <div className="flex justify-center gap-4 opacity-50 cursor-not-allowed">
              {/* Dummy social buttons matching the reference image layout */}
              <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center italic font-serif font-black text-gray-600">f</div>
              <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center font-black text-gray-600">G</div>
              <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center text-xl text-gray-600"></div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

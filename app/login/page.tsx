"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { EnhancedParticles, EnhancedAmbientOrbs } from "../../lib/3d-components-enhanced";

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

  async function handleGoogleLogin() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "An error occurred during Google sign in");
      setLoading(false);
    }
  }

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
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col md:flex-row bg-theme-bg" style={{ perspective: '1100px' }}>
      
      {/* 3D Background */}
      <EnhancedParticles particleCount={100} connectionDistance={150} mouseResponsive={true} />
      <EnhancedAmbientOrbs />

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-4 pb-8 pointer-events-none animate-page-in-r" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* Login Card */}
        <div className="w-full max-w-[420px] glass-card p-8 md:p-10 shadow-2xl shadow-theme-primary/10 pointer-events-auto backdrop-blur-2xl bg-theme-surface/80 border-theme-border">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gradient-cyan mb-2 font-display">
              Dex
            </h1>
            <h2 className="text-lg font-bold text-white">
              {mode === "login" ? "Welcome back" : "Create Account"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {mode === "login" ? "Enter your details to continue." : "Let's build your premium workspace."}
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
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-theme-primary focus:border-transparent outline-none transition-all shadow-inner"
                />
              </div>
            )}
            
            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-theme-primary focus:border-transparent outline-none transition-all shadow-inner"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-theme-primary focus:border-transparent outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <div className="text-red-400 text-xs text-center font-medium bg-red-500/10 border border-red-500/20 py-2 rounded-xl">{error}</div>}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-theme-primary to-theme-secondary hover:opacity-90 text-white rounded-xl py-3.5 text-[15px] font-bold shadow-lg shadow-theme-primary/20 transition-all flex items-center justify-center gap-2 mt-6 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (mode === "login" ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <div className="text-center mt-6 z-10 relative">
            <span className="text-xs text-gray-400">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-xs font-bold text-theme-primary hover:text-theme-secondary transition-colors"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <p className="text-xs text-gray-400 text-center mb-4">Or continue with</p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white rounded-xl py-3 text-sm font-medium transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.14 18.63 6.72 16.7 5.84 14.12H2.15V16.98C3.96 20.57 7.68 23 12 23Z" fill="#34A853"/>
                  <path d="M5.84 14.12C5.62 13.46 5.49 12.75 5.49 12C5.49 11.25 5.61 10.54 5.84 9.88V7.02H2.15C1.41 8.5 1 10.19 1 12C1 13.81 1.41 15.5 2.15 16.98L5.84 14.12Z" fill="#FBBC05"/>
                  <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.36 3.86C17.46 2.09 14.97 1 12 1C7.68 1 3.96 3.43 2.15 7.02L5.84 9.88C6.72 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

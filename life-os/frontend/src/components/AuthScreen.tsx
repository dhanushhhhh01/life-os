"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { auth } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await auth.register({
          email: form.email,
          username: form.username,
          password: form.password,
          full_name: form.full_name || undefined,
        });
        login(res.access_token, res.user);
      } else {
        const res = await auth.login({
          username: form.username,
          password: form.password,
        });
        login(res.access_token, res.user);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4 shadow-glow"
          >
            <Sparkles className="w-8 h-8 text-accent-light" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Life OS</h1>
          <p className="text-white/40 mt-2">Your AI-powered second brain</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-glass-border bg-surface-100/80 backdrop-blur-xl p-8 shadow-card">
          {/* Tabs */}
          <div className="flex gap-1 bg-surface-300/50 rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-accent/20 text-accent-light shadow-glow-sm"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="register-fields"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Input
                    label="Full Name"
                    type="text"
                    value={form.full_name}
                    onChange={set("full_name")}
                    placeholder="What should we call you?"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Username"
              type="text"
              value={form.username}
              onChange={set("username")}
              placeholder="Your username"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              required
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center bg-red-400/10 rounded-lg p-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-dark text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-glow"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Get Started"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5 ml-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl bg-surface-300/50 border border-glass-border text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all text-sm"
      />
    </div>
  );
}

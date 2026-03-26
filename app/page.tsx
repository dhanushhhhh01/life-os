"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  var router = useRouter();
  var canvasRef = useRef(null);
  var [mode, setMode] = useState("login");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [name, setName] = useState("");
  var [error, setError] = useState("");
  var [message, setMessage] = useState("");
  var [loading, setLoading] = useState(false);
  var [showPassword, setShowPassword] = useState(false);
  var [rotY, setRotY] = useState(0);
  var [rotX, setRotX] = useState(20);
  var [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Redirect if already logged in
  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  // Particle network canvas
  useEffect(function() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    var pts = Array.from({length: 80}, function() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.3 + 0.05,
      };
    });
    var id = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x;
          var dy = pts[i].y - pts[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = "rgba(79, 70, 229, " + (0.06 * (1 - dist / 150)) + ")";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      pts.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(79, 70, 229, " + p.a + ")";
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    }
    draw();
    return function() {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // 3D cube rotation
  useEffect(function() {
    var frame = 0;
    function tick() {
      setRotY(function(y) { return y + 0.35; });
      setRotX(function(x) { return x + 0.12; });
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return function() { cancelAnimationFrame(frame); };
  }, []);

  // Mouse tracking for parallax
  useEffect(function() {
    function handleMouse(e) {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    }
    window.addEventListener("mousemove", handleMouse);
    return function() { window.removeEventListener("mousemove", handleMouse); };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (mode === "register") {
        var result = await supabase.auth.signUp({
          email: email,
          password: password,
          options: { data: { name: name || "Dhanush" } }
        });
        if (result.error) {
          setError(result.error.message);
        } else {
          setMessage("Account created! Check your email to confirm, then sign in.");
          setMode("login");
        }
      } else {
        var result2 = await supabase.auth.signInWithPassword({ email: email, password: password });
        if (result2.error) {
          setError(result2.error.message);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  var faces = [
    { t: "rotateY(0deg) translateZ(50px)", bg: "rgba(79,70,229,0.15)", border: "rgba(79,70,229,0.3)" },
    { t: "rotateY(90deg) translateZ(50px)", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    { t: "rotateY(180deg) translateZ(50px)", bg: "rgba(79,70,229,0.15)", border: "rgba(79,70,229,0.3)" },
    { t: "rotateY(-90deg) translateZ(50px)", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    { t: "rotateX(90deg) translateZ(50px)", bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.25)" },
    { t: "rotateX(-90deg) translateZ(50px)", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)" },
  ];

  return (
    <div className="min-h-screen bg-[#030308] flex items-center justify-center overflow-hidden relative">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-morph"
          style={{
            top: "15%", left: "20%",
            transform: "translate(" + (mousePos.x * 0.5) + "px, " + (mousePos.y * 0.5) + "px)",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] bg-amber-600/[0.06] rounded-full blur-[100px] animate-morph"
          style={{
            bottom: "20%", right: "15%",
            animationDelay: "-4s",
            transform: "translate(" + (mousePos.x * -0.3) + "px, " + (mousePos.y * -0.3) + "px)",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] bg-pink-600/[0.05] rounded-full blur-[80px]"
          style={{
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%) translate(" + (mousePos.x * 0.2) + "px, " + (mousePos.y * 0.2) + "px)",
          }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-md px-6 animate-fade-in"
        style={{
          transform: "translate(" + (mousePos.x * 0.05) + "px, " + (mousePos.y * 0.05) + "px)",
        }}
      >
        {/* 3D Cube */}
        <div className="flex justify-center mb-10">
          <div style={{ perspective: "600px", width: 100, height: 100 }}>
            <div style={{
              width: 100, height: 100, position: "relative",
              transformStyle: "preserve-3d",
              transform: "rotateX(" + (rotX + mousePos.y * 0.5) + "deg) rotateY(" + (rotY + mousePos.x * 0.5) + "deg)",
            }}>
              {faces.map(function(face, i) {
                return (
                  <div key={i} style={{
                    position: "absolute", width: 100, height: 100,
                    border: "1px solid " + face.border,
                    background: face.bg,
                    backdropFilter: "blur(8px)",
                    transform: face.t,
                    boxShadow: "inset 0 0 30px rgba(79,70,229,0.1)",
                  }} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-gradient-gold mb-3 font-display tracking-tight">
            Life OS
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">Your Personal Second Brain & AI Life Coach</p>
        </div>

        {/* Form Card */}
        <div className="glass-card-static p-8 rounded-3xl border border-white/[0.08] shadow-2xl shadow-indigo-500/5">
          {/* Tab Switcher */}
          <div className="flex bg-white/[0.04] rounded-2xl p-1 mb-7">
            <button
              onClick={function() { setMode("login"); setError(""); setMessage(""); }}
              className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 " + (mode === "login" ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 hover:text-white")}
            >
              Sign In
            </button>
            <button
              onClick={function() { setMode("register"); setError(""); setMessage(""); }}
              className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 " + (mode === "register" ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20" : "text-gray-500 hover:text-white")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="animate-slide-up">
                <label className="text-[11px] text-gray-500 uppercase tracking-[0.15em] mb-1.5 block font-medium">Your Name</label>
                <input type="text" value={name} onChange={function(e) { setName(e.target.value); }}
                  placeholder="e.g. Dhanush"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm transition-all" />
              </div>
            )}
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-[0.15em] mb-1.5 block font-medium">Email</label>
              <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }}
                placeholder="you@example.com" required
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm transition-all" />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 uppercase tracking-[0.15em] mb-1.5 block font-medium">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={function(e) { setPassword(e.target.value); }}
                  placeholder="........" required
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-600 text-sm transition-all" />
                <button type="button" onClick={function() { setShowPassword(!showPassword); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 animate-slide-up">
                {error}
              </div>
            )}
            {message && (
              <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 animate-slide-up">
                {message}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-600 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mt-3 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 group">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <span>{mode === "login" ? "Enter Life OS" : "Create Account"}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          <div className="mt-5 text-center">
            <p className="text-xs text-gray-700">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={function() { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }}
                className="text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
              >
                {mode === "login" ? "Register" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
        <p className="text-center text-gray-700 text-xs mt-8 tracking-wide">
          Built for Dhanush Ramesh Babu - Berlin 2026
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(20);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pts = Array.from({length: 60}, function() { return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.4 + 0.1,
      }; });
    let id = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(function(p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168,85,247," + p.a + ")";
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    }
    draw();
    return function() { cancelAnimationFrame(id); };
  }, []);

  useEffect(() => {
    let frame = 0;
    function tick() {
      setRotY(function(y) { return y + 0.4; });
      setRotX(function(x) { return x + 0.15; });
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return function() { cancelAnimationFrame(frame); };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(function() {
      if (mode === "register") {
        localStorage.setItem("life-os-user", JSON.stringify({ name: name || "Dhanush", email: email }));
        localStorage.setItem("life-os-auth", "true");
        router.push("/dashboard");
      } else {
        var user = localStorage.getItem("life-os-user");
        if (user || email === "dhanush@life-os.ai") {
          localStorage.setItem("life-os-auth", "true");
          router.push("/dashboard");
        } else {
          setError("No account found. Please register first.");
          setLoading(false);
        }
      }
    }, 800);
  }

  var faces = [
    { t: "rotateY(0deg) translateZ(40px)", bg: "rgba(168,85,247,0.25)" },
    { t: "rotateY(90deg) translateZ(40px)", bg: "rgba(34,211,238,0.2)" },
    { t: "rotateY(180deg) translateZ(40px)", bg: "rgba(168,85,247,0.25)" },
    { t: "rotateY(-90deg) translateZ(40px)", bg: "rgba(34,211,238,0.2)" },
    { t: "rotateX(90deg) translateZ(40px)", bg: "rgba(236,72,153,0.2)" },
    { t: "rotateX(-90deg) translateZ(40px)", bg: "rgba(99,102,241,0.2)" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center overflow-hidden relative">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" />
      </div>
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="flex justify-center mb-8">
          <div style={{ perspective: "500px", width: 80, height: 80 }}>
            <div style={{
              width: 80, height: 80, position: "relative",
              transformStyle: "preserve-3d",
              transform: "rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)",
            }}>
              {faces.map(function(face, i) {
                return (
                  <div key={i} style={{
                    position: "absolute", width: 80, height: 80,
                    border: "1px solid rgba(168,85,247,0.5)",
                    background: face.bg,
                    transform: face.t,
                  }} />
                );
              })}
            </div>
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Life OS
          </h1>
          <p className="text-gray-500 text-sm">Your Personal Second Brain and AI Life Coach</p>
        </div>
        <div className="glass-card p-8 rounded-3xl border border-white/10">
          <div className="flex bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={function() { setMode("login"); setError(""); }}
              className={"flex-1 py-2 rounded-lg text-sm font-semibold transition-all " + (mode === "login" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white")}
            >
              Sign In
            </button>
            <button
              onClick={function() { setMode("register"); setError(""); }}
              className={"flex-1 py-2 rounded-lg text-sm font-semibold transition-all " + (mode === "register" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white")}
            >
              Register
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Your Name</label>
                <input type="text" value={name} onChange={function(e) { setName(e.target.value); }}
                  placeholder="e.g. Dhanush"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Email</label>
              <input type="email" value={email} onChange={function(e) { setEmail(e.target.value); }}
                placeholder="you@example.com" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Password</label>
              <input type="password" value={password} onChange={function(e) { setPassword(e.target.value); }}
                placeholder="........" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 text-sm" />
            </div>
            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-2">
              {loading ? "Loading..." : (mode === "login" ? "Enter Life OS" : "Create Account")}
            </button>
          </form>
          {mode === "login" && (
            <div className="mt-4 text-center">
              <button
                onClick={function() {
                  localStorage.setItem("life-os-auth", "true");
                  router.push("/dashboard");
                }}
                className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
              >
                Demo mode - skip login
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">
          Built for Dhanush Ramesh Babu - Berlin 2026
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: Array<{x:number;y:number;z:number;vx:number;vy:number;size:number;color:string}> = [];
    const colors = ["#6366f1","#a855f7","#ec4899","#818cf8","#c084fc"];
    
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    
    const handleMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener("mousemove", handleMouse);
    
    let animId: number;
    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 26, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 200) {
          p.vx += dx * 0.00005;
          p.vy += dy * 0.00005;
        }
        
        p.x += p.vx;
        p.y += p.vy;
        p.z -= 0.5;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        if (p.z < 0) p.z = 1000;
        
        const scale = 1000 / (1000 + p.z);
        const size = p.size * scale;
        const alpha = scale * 0.8;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(alpha * 255).toString(16).padStart(2,"0");
        ctx.fill();
        
        particles.forEach((p2, j) => {
          if (j <= i) return;
          const d = Math.sqrt((p.x-p2.x)**2 + (p.y-p2.y)**2);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99,102,241,${(1-d/120)*0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    
    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", handleResize);
    
    return () => { 
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
}

function FloatingOrb({ delay, size, color, x, y }: {delay:number;size:number;color:string;x:string;y:string}) {
  return (
    <div
      className="absolute animate-morph opacity-30"
      style={{
        left: x, top: y, width: size, height: size,
        background: `radial-gradient(circle, ${color}, transparent)`,
        filter: "blur(40px)",
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function Cube3D() {
  const [rotation, setRotation] = useState({ x: -20, y: 45 });
  
  useEffect(() => {
    let frame: number;
    let angle = 0;
    const spin = () => {
      angle += 0.3;
      setRotation({ x: -20 + Math.sin(angle * 0.01) * 10, y: angle });
      frame = requestAnimationFrame(spin);
    };
    spin();
    return () => cancelAnimationFrame(frame);
  }, []);
  
  const faces = [
    { transform: "rotateY(0deg) translateZ(60px)", bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.4)", icon: "\u{1F3AF}" },
    { transform: "rotateY(90deg) translateZ(60px)", bg: "rgba(168,85,247,0.15)", border: "rgba(168,85,247,0.4)", icon: "\u{1F4D3}" },
    { transform: "rotateY(180deg) translateZ(60px)", bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.4)", icon: "\u{1F9E0}" },
    { transform: "rotateY(270deg) translateZ(60px)", bg: "rgba(34,211,238,0.15)", border: "rgba(34,211,238,0.4)", icon: "\u{2764}\u{FE0F}" },
    { transform: "rotateX(90deg) translateZ(60px)", bg: "rgba(52,211,153,0.15)", border: "rgba(52,211,153,0.4)", icon: "\u{1F680}" },
    { transform: "rotateX(-90deg) translateZ(60px)", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.4)", icon: "\u{2728}" },
  ];
  
  return (
    <div className="w-[120px] h-[120px]" style={{ perspective: "600px" }}>
      <div
        className="w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {faces.map((face, i) => (
          <div
            key={i}
            className="absolute w-[120px] h-[120px] flex items-center justify-center text-3xl"
            style={{
              transform: face.transform,
              background: face.bg,
              border: `1px solid ${face.border}`,
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
              backfaceVisibility: "hidden",
            }}
          >
            {face.icon}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  useEffect(() => { 
    setMounted(true);
    if (typeof window !== "undefined" && localStorage.getItem("lifeos_user")) {
      router.push("/dashboard");
    }
  }, [router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    localStorage.setItem("lifeos_user", JSON.stringify({ email, name: name || email.split("@")[0] }));
    router.push("/dashboard");
  };
  
  if (!mounted) return null;
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a1a]">
      <ParticleField />
      
      <FloatingOrb delay={0} size={400} color="#6366f1" x="10%" y="20%" />
      <FloatingOrb delay={2} size={300} color="#a855f7" x="70%" y="60%" />
      <FloatingOrb delay={4} size={350} color="#ec4899" x="50%" y="10%" />
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12">
          <div className="animate-float mb-8">
            <Cube3D />
          </div>
          
          <h1 className="text-6xl font-bold text-gradient mb-4 text-center">
            Life OS
          </h1>
          <p className="text-xl text-slate-400 text-center max-w-md mb-8">
            Your AI-powered second brain for goals, mood, habits & life coaching
          </p>
          
          <div className="flex gap-6 mt-4">
            {[
              { icon: "\u{1F3AF}", label: "Goals" },
              { icon: "\u{1F4D3}", label: "Journal" },
              { icon: "\u{1F9E0}", label: "AI Coach" },
              { icon: "\u{1F4CA}", label: "Analytics" },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card p-4 text-center animate-fade-in"
                style={{ animationDelay: `${i * 0.15}s`, opacity: 0 }}
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xs text-slate-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-block animate-float mb-4">
                <Cube3D />
              </div>
              <h1 className="text-4xl font-bold text-gradient">Life OS</h1>
              <p className="text-slate-400 mt-2">Your personal second brain</p>
            </div>
            
            <div className="glass-card p-8 animate-pulse-glow">
              <div className="flex mb-8 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isLogin ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    !isLogin ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="animate-fade-in">
                    <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      placeholder="Dhanush Ramesh Babu"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="\u{2022}\u{2022}\u{2022}\u{2022}\u{2022}\u{2022}\u{2022}\u{2022}"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl font-medium text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 animate-gradient"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Entering your universe...
                    </span>
                  ) : isLogin ? "Sign In to Life OS" : "Create Your Universe"}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  {isLogin ? "New to Life OS?" : "Already have an account?"}{" "}
                  <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-400 hover:text-indigo-300 font-medium">
                    {isLogin ? "Create an account" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
            
            <p className="text-center text-xs text-slate-600 mt-6">
              Built with \u{2764}\u{FE0F} by Dhanush | Powered by AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

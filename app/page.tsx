"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  var router = useRouter();
  var bgCanvasRef = useRef(null);
  var neuralRef = useRef(null);
  var mousePosRef = useRef({ x: 0, y: 0 });
  var [mode, setMode] = useState("login");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [name, setName] = useState("");
  var [error, setError] = useState("");
  var [message, setMessage] = useState("");
  var [loading, setLoading] = useState(false);
  var [showPassword, setShowPassword] = useState(false);
  var [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Redirect if logged in
  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) router.push("/dashboard");
    });
  }, [router]);

  // Background particle canvas
  useEffect(function() {
    var canvas = bgCanvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    var pts = Array.from({length: 70}, function() {
      return {
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.2 + 0.04,
      };
    });
    var id = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = "rgba(70,240,210," + (0.05 * (1 - dist / 140)) + ")";
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      pts.forEach(function(p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(70,240,210," + p.a + ")"; ctx.fill();
      });
      id = requestAnimationFrame(draw);
    }
    draw();
    return function() { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);

  // 3D Neural Network Brain
  useEffect(function() {
    var canvas = neuralRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = 300, H = 300;
    canvas.width = W; canvas.height = H;
    var CX = W / 2, CY = H / 2;
    var R = 105;
    var frameNum = 0;
    var rotY = 0;

    // 6 hub nodes: the life sections
    var hubData = [
      { nx: 0, ny: -1, nz: 0, label: "Goals", color: [251,226,180] },
      { nx: 1, ny: -0.2, nz: 0.2, label: "Habits", color: [251,226,180] },
      { nx: 0.6, ny: 0.7, nz: -0.4, label: "Journal", color: [251,226,180] },
      { nx: -1, ny: -0.2, nz: -0.2, label: "Focus", color: [251,226,180] },
      { nx: -0.5, ny: 0.7, nz: 0.5, label: "Check-In", color: [251,226,180] },
      { nx: 0.1, ny: 0.3, nz: -1, label: "Coach", color: [251,226,180] },
    ];

    // Generate 40 regular nodes using Fibonacci sphere
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    var regularNodes = [];
    for (var i = 0; i < 40; i++) {
      var y = 1 - (i / 39) * 2;
      var rr = Math.sqrt(Math.max(0, 1 - y * y));
      var theta = goldenAngle * i;
      regularNodes.push({ nx: Math.cos(theta) * rr, ny: y, nz: Math.sin(theta) * rr });
    }

    // Build node list
    var nodes = [];
    hubData.forEach(function(h) {
      var len = Math.sqrt(h.nx*h.nx + h.ny*h.ny + h.nz*h.nz);
      nodes.push({ ox: h.nx/len * R, oy: h.ny/len * R, oz: h.nz/len * R, isHub: true, label: h.label, phase: Math.random() * Math.PI * 2 });
    });
    regularNodes.forEach(function(n) {
      nodes.push({ ox: n.nx * R, oy: n.ny * R, oz: n.nz * R, isHub: false, label: null, phase: Math.random() * Math.PI * 2 });
    });

    // Build edges (each node connects to nearest 4-5 neighbors)
    var edges = [];
    var edgeSet = {};
    for (var i = 0; i < nodes.length; i++) {
      var dists = [];
      for (var j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        var dx = nodes[i].ox - nodes[j].ox;
        var dy = nodes[i].oy - nodes[j].oy;
        var dz = nodes[i].oz - nodes[j].oz;
        dists.push({ j: j, d: Math.sqrt(dx*dx+dy*dy+dz*dz) });
      }
      dists.sort(function(a, b) { return a.d - b.d; });
      var k = nodes[i].isHub ? 7 : 4;
      for (var m = 0; m < k && m < dists.length; m++) {
        var key = Math.min(i, dists[m].j) + "_" + Math.max(i, dists[m].j);
        if (!edgeSet[key]) { edgeSet[key] = true; edges.push([i, dists[m].j]); }
      }
    }

    function rotYfn(x, y, z, a) {
      return { x: x * Math.cos(a) + z * Math.sin(a), y: y, z: -x * Math.sin(a) + z * Math.cos(a) };
    }
    function rotXfn(x, y, z, a) {
      return { x: x, y: y * Math.cos(a) - z * Math.sin(a), z: y * Math.sin(a) + z * Math.cos(a) };
    }
    function project(x, y, z) {
      var fov = 380;
      var scale = fov / (fov + z);
      return { px: CX + x * scale, py: CY + y * scale, scale: scale };
    }

    var id = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Slow mouse-influenced tilt
      var mx = mousePosRef.current.x * 0.008;
      var my = mousePosRef.current.y * 0.006;
      var tiltX = 0.25 + my + Math.sin(frameNum * 0.004) * 0.06;
      rotY += 0.0045;

      // Draw outer atmosphere glow
      var atmGrad = ctx.createRadialGradient(CX, CY, R * 0.7, CX, CY, R * 1.25);
      atmGrad.addColorStop(0, "rgba(70,240,210,0.0)");
      atmGrad.addColorStop(0.6, "rgba(70,240,210,0.03)");
      atmGrad.addColorStop(1, "rgba(70,240,210,0.0)");
      ctx.beginPath(); ctx.arc(CX, CY, R * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = atmGrad; ctx.fill();

      // Transform all nodes
      var transformed = nodes.map(function(n) {
        var r1 = rotYfn(n.ox, n.oy, n.oz, rotY + mx);
        var r2 = rotXfn(r1.x, r1.y, r1.z, tiltX);
        var proj = project(r2.x, r2.y, r2.z);
        return { px: proj.px, py: proj.py, z: r2.z, scale: proj.scale, isHub: n.isHub, label: n.label, phase: n.phase };
      });

      // Draw edges (back to front - draw all with depth-based alpha)
      edges.forEach(function(e) {
        var a = transformed[e[0]], b = transformed[e[1]];
        var avgZ = (a.z + b.z) / 2;
        var depthFactor = (avgZ + R) / (2 * R);
        var alpha = Math.max(0.03, depthFactor * 0.3);
        // Hub edges are brighter
        var isHubEdge = nodes[e[0]].isHub || nodes[e[1]].isHub;
        if (isHubEdge) alpha = Math.max(0.06, depthFactor * 0.45);
        ctx.beginPath();
        ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py);
        ctx.strokeStyle = "rgba(70,240,210," + alpha + ")";
        ctx.lineWidth = isHubEdge ? 0.8 : 0.5;
        ctx.stroke();
      });

      // Sort nodes by z for depth-correct rendering
      var sortedIdx = transformed.map(function(_, i) { return i; });
      sortedIdx.sort(function(a, b) { return transformed[a].z - transformed[b].z; });

      // Draw nodes
      sortedIdx.forEach(function(idx) {
        var n = transformed[idx];
        var depthFactor = (n.z + R) / (2 * R);
        var pulse = Math.sin(frameNum * 0.025 + n.phase) * 0.5 + 0.5;

        if (n.isHub) {
          var nodeR = (5 + pulse * 2.5) * n.scale;
          var alpha = 0.55 + depthFactor * 0.45;

          // Outer glow ring
          var outerGrad = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, nodeR * 3.5);
          outerGrad.addColorStop(0, "rgba(251,226,180," + (alpha * 0.4) + ")");
          outerGrad.addColorStop(0.5, "rgba(251,226,180," + (alpha * 0.12) + ")");
          outerGrad.addColorStop(1, "rgba(251,226,180,0)");
          ctx.beginPath(); ctx.arc(n.px, n.py, nodeR * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = outerGrad; ctx.fill();

          // Core node
          var coreGrad = ctx.createRadialGradient(n.px - nodeR * 0.3, n.py - nodeR * 0.3, 0, n.px, n.py, nodeR);
          coreGrad.addColorStop(0, "rgba(255,245,220," + alpha + ")");
          coreGrad.addColorStop(1, "rgba(251,180,80," + (alpha * 0.7) + ")");
          ctx.beginPath(); ctx.arc(n.px, n.py, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = coreGrad; ctx.fill();

          // Label (only for front-facing hubs)
          if (n.z > -20 && n.label) {
            var labelAlpha = Math.max(0, (n.z + 20) / (R + 20));
            ctx.save();
            ctx.font = "bold " + Math.round(9 * n.scale + 4) + "px Inter, sans-serif";
            ctx.fillStyle = "rgba(251,226,180," + (labelAlpha * 0.95) + ")";
            ctx.shadowColor = "rgba(251,226,180,0.4)";
            ctx.shadowBlur = 6;
            ctx.textAlign = "center";
            // Offset label above or below node
            var labelY = n.py + (idx < 6 && n.py < CY ? -(nodeR + 8) : (nodeR + 14));
            ctx.fillText(n.label, n.px, labelY);
            ctx.restore();
          }
        } else {
          var nodeR = (1.6 + depthFactor * 1.0) * n.scale;
          var alpha = 0.25 + depthFactor * 0.55;
          ctx.beginPath(); ctx.arc(n.px, n.py, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(70,240,210," + alpha + ")";
          ctx.fill();
        }
      });

      // Central core glow
      var coreGlow = ctx.createRadialGradient(CX, CY, 0, CX, CY, 18);
      coreGlow.addColorStop(0, "rgba(70,240,210," + (0.06 + Math.sin(frameNum * 0.02) * 0.03) + ")");
      coreGlow.addColorStop(1, "rgba(70,240,210,0)");
      ctx.beginPath(); ctx.arc(CX, CY, 18, 0, Math.PI * 2);
      ctx.fillStyle = coreGlow; ctx.fill();

      frameNum++;
      id = requestAnimationFrame(draw);
    }
    draw();
    return function() { cancelAnimationFrame(id); };
  }, []);

  // Mouse tracking
  useEffect(function() {
    function handleMouse(e) {
      var mx = (e.clientX / window.innerWidth - 0.5) * 30;
      var my = (e.clientY / window.innerHeight - 0.5) * 30;
      mousePosRef.current = { x: mx, y: my };
      setMousePos({ x: mx, y: my });
    }
    window.addEventListener("mousemove", handleMouse);
    return function() { window.removeEventListener("mousemove", handleMouse); };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    try {
      if (mode === "register") {
        var result = await supabase.auth.signUp({ email, password, options: { data: { name: name || "Dhanush" } } });
        if (result.error) { setError(result.error.message); }
        else { setMessage("Account created! Check your email to confirm, then sign in."); setMode("login"); }
      } else {
        var result2 = await supabase.auth.signInWithPassword({ email, password });
        if (result2.error) { setError(result2.error.message); }
        else { router.push("/dashboard"); }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0e1e] flex items-center justify-center overflow-hidden relative">
      <canvas ref={bgCanvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-[#46F0D2]/[0.05] rounded-full blur-[130px] animate-morph"
          style={{ top: "10%", left: "15%", transform: "translate(" + (mousePos.x * 0.4) + "px," + (mousePos.y * 0.4) + "px)" }} />
        <div className="absolute w-[500px] h-[500px] bg-[#FBE2B4]/[0.04] rounded-full blur-[120px] animate-morph"
          style={{ bottom: "15%", right: "10%", animationDelay: "-5s", transform: "translate(" + (mousePos.x * -0.3) + "px," + (mousePos.y * -0.3) + "px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in flex flex-col items-center"
        style={{ transform: "translate(" + (mousePos.x * 0.04) + "px," + (mousePos.y * 0.04) + "px)" }}>

        {/* 3D Neural Network */}
        <div className="relative mb-4" style={{ width: 300, height: 300 }}>
          <canvas ref={neuralRef} className="block" style={{ width: 300, height: 300 }} />
        </div>

        {/* Title */}
        <div className="text-center mb-7 -mt-4">
          <h1 className="text-5xl font-black text-gradient-gold mb-2 font-display tracking-tight">
            Life OS
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">Your Personal Second Brain &amp; AI Life Coach</p>
        </div>

        {/* Form Card */}
        <div className="w-full glass-card-static p-8 rounded-3xl border border-white/[0.07] shadow-2xl shadow-[#46F0D2]/[0.04]">
          {/* Tab Switcher */}
          <div className="flex bg-white/[0.04] rounded-2xl p-1 mb-6">
            <button
              onClick={function() { setMode("login"); setError(""); setMessage(""); }}
              className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 " + (mode === "login" ? "bg-gradient-to-r from-[#46F0D2] to-[#FBE2B4] text-[#131321] shadow-lg" : "text-gray-500 hover:text-white")}
            >
              Sign In
            </button>
            <button
              onClick={function() { setMode("register"); setError(""); setMessage(""); }}
              className={"flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 " + (mode === "register" ? "bg-gradient-to-r from-[#46F0D2] to-[#FBE2B4] text-[#131321] shadow-lg" : "text-gray-500 hover:text-white")}
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
              <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
            )}
            {message && (
              <div className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">{message}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#46F0D2] via-[#2dd8bc] to-[#FBE2B4] text-[#131321] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-lg shadow-[#46F0D2]/20 group">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#131321]/30 border-t-[#131321] rounded-full animate-spin" />
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
              {mode === "login" ? "No account? " : "Have an account? "}
              <button type="button"
                onClick={function() { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }}
                className="text-[#46F0D2] hover:opacity-80 transition-opacity font-medium">
                {mode === "login" ? "Register" : "Sign In"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6 tracking-wide">
          Built for Dhanush Ramesh Babu &mdash; Berlin 2026
        </p>
      </div>
    </div>
  );
}

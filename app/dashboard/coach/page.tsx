"use client";
import { useState, useRef, useEffect } from "react";
export default function CoachPage() {
  const [msgs,setMsgs]=useState([{role:"ai",text:"Hey! I am Dex, your AI life coach. I can help with goal planning, productivity tips, career advice, or just be a sounding board. What is on your mind? 🚀"}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs]);
  const responses=[
    "Great question! Based on your goals, I would suggest breaking this down into smaller weekly milestones. What specific area feels most urgent?",
    "I notice your coding habit is at a 12 day streak! That discipline is exactly what you need. Let us channel that same energy into German practice.",
    "For your AI internship goal, I would recommend building a RAG-based project. Companies love seeing practical LLM applications. Want me to outline a project idea?",
    "Your mood data shows you feel best on days you exercise before coding. Consider making that your morning sequence: exercise then code.",
    "You are doing a Master in Germany while working part-time and building AI projects. That is impressive. Be kind to yourself on harder days.",
  ];
  const send=()=>{
    if(!input.trim())return;
    const txt=input;
    setMsgs(m=>[...m,{role:"user",text:txt}]);setInput("");setTyping(true);
    setTimeout(()=>{setMsgs(m=>[...m,{role:"ai",text:responses[Math.floor(Math.random()*responses.length)]}]);setTyping(false);},1500);
  };
  return (
    <div className="flex flex-col" style={{height:"calc(100vh - 8rem)"}}>
      <div className="mb-4"><h1 className="text-2xl font-bold text-gradient">🧠 AI Coach</h1><p className="text-sm text-slate-500 mt-1">Chat with Dex, your personal AI life coach</p></div>
      <div ref={ref} className="flex-1 overflow-y-auto space-y-4 scrollbar-hide mb-4">
        {msgs.map((m,i)=>(
          <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"} animate-fade-in`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role==="user"?"bg-indigo-500 text-white rounded-br-sm":"glass-card rounded-bl-sm"}`}>
              {m.role==="ai"&&<span className="text-indigo-400 font-medium text-xs block mb-1">Dex 🚀</span>}
              {m.text}
            </div>
          </div>
        ))}
        {typing&&<div className="flex justify-start"><div className="glass-card px-4 py-3 rounded-2xl rounded-bl-sm"><span className="text-indigo-400 font-medium text-xs block mb-1">Dex 🚀</span><span className="text-slate-400 animate-pulse">Thinking...</span></div></div>}
      </div>
      <div className="flex gap-3">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask Dex anything..." className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
        <button onClick={send} disabled={typing} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-medium text-sm disabled:opacity-50 hover:scale-105 transition-all">Send</button>
      </div>
    </div>
  );
}

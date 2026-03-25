"use client";
import { useState } from "react";
export default function GoalsPage() {
  const [goals, setGoals] = useState([
    {id:1,name:"Master FastAPI & LLMs",progress:45,target:"Jun 2026",icon:"🚀",color:"from-indigo-500 to-purple-500"},
    {id:2,name:"German to B1 Level",progress:30,target:"Sep 2026",icon:"🇩🇪",color:"from-emerald-500 to-teal-500"},
    {id:3,name:"Land AI/Robotics Internship",progress:20,target:"May 2026",icon:"💼",color:"from-orange-500 to-red-500"},
    {id:4,name:"Build 5 Portfolio Projects",progress:60,target:"Jul 2026",icon:"💻",color:"from-pink-500 to-rose-500"},
    {id:5,name:"Complete 6-Month AI Roadmap",progress:35,target:"Aug 2026",icon:"🧠",color:"from-cyan-500 to-blue-500"},
  ]);
  const [showAdd,setShowAdd] = useState(false);
  const [newGoal,setNewGoal] = useState("");
  const add = () => { if(!newGoal.trim())return; setGoals([...goals,{id:Date.now(),name:newGoal,progress:0,target:"TBD",icon:"⭐",color:"from-violet-500 to-purple-500"}]); setNewGoal("");setShowAdd(false); };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gradient">🎯 Goals</h1><p className="text-sm text-slate-500 mt-1">Track your ambitions</p></div>
        <button onClick={()=>setShowAdd(!showAdd)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-all">+ New Goal</button>
      </div>
      {showAdd&&<div className="glass-card p-4 animate-fade-in"><div className="flex gap-3"><input value={newGoal} onChange={e=>setNewGoal(e.target.value)} placeholder="What do you want to achieve?" className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" onKeyDown={e=>e.key==="Enter"&&add()} /><button onClick={add} className="px-6 py-2 bg-indigo-500 rounded-xl text-sm font-medium">Add</button></div></div>}
      <div className="grid gap-4">
        {goals.map((g,i)=>(
          <div key={g.id} className="glass-card p-6 animate-fade-in" style={{animationDelay:`${i*0.1}s`,opacity:0}}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}>{g.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1"><h3 className="font-medium truncate">{g.name}</h3><span className="text-xs text-slate-500 shrink-0 ml-2">{g.target}</span></div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${g.color} rounded-full`} style={{width:`${g.progress}%`}} /></div>
                <div className="flex justify-between mt-1"><span className="text-xs text-slate-500">{g.progress}% complete</span><button onClick={()=>setGoals(goals.map(x=>x.id===g.id?{...x,progress:Math.min(100,x.progress+10)}:x))} className="text-xs text-indigo-400 hover:text-indigo-300">+10%</button></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

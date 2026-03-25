"use client";
import { useState } from "react";
export default function HabitsPage() {
  const [habits,setHabits]=useState([
    {id:1,name:"Morning Coding Session",icon:"💻",streak:12,best:15,done:true,time:"07:00"},
    {id:2,name:"Exercise / Gym",icon:"🏋",streak:5,best:14,done:false,time:"08:00"},
    {id:3,name:"Read 30 Minutes",icon:"📖",streak:8,best:22,done:true,time:"21:00"},
    {id:4,name:"German Practice",icon:"🇩🇪",streak:3,best:10,done:false,time:"12:00"},
    {id:5,name:"Meditation",icon:"🧘",streak:2,best:7,done:false,time:"06:30"},
    {id:6,name:"Journal Entry",icon:"✏️",streak:6,best:18,done:true,time:"22:00"},
  ]);
  const toggle=(id:number)=>setHabits(habits.map(h=>h.id===id?{...h,done:!h.done,streak:!h.done?h.streak+1:Math.max(0,h.streak-1)}:h));
  const doneCount=habits.filter(h=>h.done).length;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gradient">⚡ Habits</h1><p className="text-sm text-slate-500 mt-1">Build consistency, build your life</p></div>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3"><span className="text-sm text-slate-400">Today&apos;s Progress</span><span className="text-sm font-bold text-indigo-400">{doneCount}/{habits.length}</span></div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{width:`${(doneCount/habits.length)*100}%`}} /></div>
      </div>
      <div className="grid gap-3">
        {habits.map((h,i)=>(
          <div key={h.id} onClick={()=>toggle(h.id)} className={`glass-card p-4 cursor-pointer animate-fade-in transition-all ${h.done?"border-indigo-500/30 bg-indigo-500/5":""}`} style={{animationDelay:`${i*0.08}s`,opacity:0}}>
            <div className="flex items-center gap-4">
              <button className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${h.done?"bg-indigo-500 border-indigo-500":"border-slate-600"}`}>{h.done&&<span className="text-sm">✓</span>}</button>
              <span className="text-2xl">{h.icon}</span>
              <div className="flex-1 min-w-0"><p className={`font-medium ${h.done?"line-through text-slate-500":""}`}>{h.name}</p><p className="text-xs text-slate-500">{h.time}</p></div>
              <div className="text-right shrink-0"><div className="text-sm font-bold text-orange-400">🔥 {h.streak}</div><div className="text-xs text-slate-600">Best: {h.best}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

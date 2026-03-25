"use client";
import { useState } from "react";
export default function JournalPage() {
  const [entries,setEntries]=useState([
    {id:1,date:"Mar 25, 2026",title:"Deployment Victory",content:"Finally got Life OS deployed on Netlify after hours of debugging. Learned a lot about Next.js build configs and Tailwind setup.",mood:"😄",tags:["coding","win"]},
    {id:2,date:"Mar 24, 2026",title:"AI Roadmap Progress",content:"Started learning about RAG systems and vector databases. The concept of embedding text into vectors for semantic search is fascinating.",mood:"🤔",tags:["learning","ai"]},
    {id:3,date:"Mar 23, 2026",title:"Berlin Spring",content:"Beautiful weather in Berlin today. Took a walk through Tiergarten after class. Cherry blossoms starting to bloom.",mood:"😊",tags:["life","berlin"]},
  ]);
  const [writing,setWriting]=useState(false);
  const [title,setTitle]=useState("");
  const [content,setContent]=useState("");
  const save=()=>{
    if(!title.trim())return;
    setEntries([{id:Date.now(),date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),title,content,mood:"✏️",tags:["new"]},...entries]);
    setTitle("");setContent("");setWriting(false);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gradient">📓 Journal</h1><p className="text-sm text-slate-500 mt-1">Your thoughts and reflections</p></div>
        <button onClick={()=>setWriting(!writing)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-medium transition-all">{writing?"Cancel":"+ New Entry"}</button>
      </div>
      {writing&&(
        <div className="glass-card p-6 animate-fade-in space-y-4">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Entry title..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-medium placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          <textarea value={content} onChange={e=>setContent(e.target.value)} rows={6} placeholder="Write your thoughts..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none" />
          <button onClick={save} className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-sm font-medium">Save Entry</button>
        </div>
      )}
      <div className="space-y-4">
        {entries.map((e,i)=>(
          <div key={e.id} className="glass-card p-6 animate-fade-in" style={{animationDelay:`${i*0.1}s`,opacity:0}}>
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-medium text-lg">{e.mood} {e.title}</h3><p className="text-xs text-slate-500 mt-1">{e.date}</p></div>
              <div className="flex gap-2">{e.tags.map(t=>(<span key={t} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-xs">{t}</span>))}</div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{e.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

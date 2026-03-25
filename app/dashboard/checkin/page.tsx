"use client";
import { useState } from "react";
export default function CheckinPage() {
  const [mood, setMood] = useState(7);
  const [energy, setEnergy] = useState(8);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),3000); };  const moods = ["😩","😞","🙁","😕","😐","🙂","😊","
  const col = (v: number) => v >= 7 ? "text-emerald-400" : v >= 4 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gradient">📊 Daily Check-in</h1>
        <p className="text-sm text-slate-500 mt-1">How are you feeling today?</p>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Mood: <span className={`text-lg font-bold ${col(mood)}`}>{mood}/10</span></h3>
        <div className="flex justify-between mb-2">
          {moods.map((m,i)=>(
            <button key={i} onClick={()=>setMood(i+1)} className={`text-2xl transition-all hover:scale-125 ${mood===i+1?"scale-125":"opacity-50"}`}>{m}</button>
          ))}
        </div>
        <input type="range" min="1" max="10" value={mood} onChange={e=>setMood(+e.target.value)} className="w-full accent-indigo-500 mt-2" />
      </div>
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Energy: <span className={`text-lg font-bold ${col(energy)}`}>{energy}/10</span></h3>
        <div className="flex justify-between mb-2">
          {Array.from({length:10},(_,i)=>(
            <button key={i} onClick={()=>setEnergy(i+1)} className={`text-xl transition-all hover:scale-110 ${i<energy?"opacity-100":"opacity-20"}`}>⚡</button>
          ))}
        </div>
        <input type="range" min="1" max="10" value={energy} onChange={e=>setEnergy(+e.target.value)} className="w-full accent-purple-500 mt-2" />
      </div>
      <div className="glass-card p-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Notes</h3>
        <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="How was your day? Any highlights or low points?" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none" />
      </div>
      <button onClick={save} className={`w-full py-3 rounded-xl font-medium transition-all ${saved?"bg-emerald-500 text-white":"bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-[1.02]"}`}>
        {saved ? "✅ Saved!" : "Save Check-in"}
      </button>
      <div className="glass-card p-5">
        <h3 className="texctd- s/mt mfpo/nlti-fmee-doisu-mf itxe x&t&- sgliatt ea-d4d0 0- Am b&-&4 "g>iTth isst aWteuesk <-/-hs3h>o
r t 
      <div className="flex justify-around">
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i)=>(
            <div key={d} className="text-center">
              <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold ${i<5?"bg-indigo-500/30 text-indigo-300":"bg-white/5 text-slate-600"}`}>{i<5?[7,6,8,5,7][i]:"-"}</div>
              <div className="text-xs text-slate-600">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

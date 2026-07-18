"use client";

import { useEffect, useMemo, useState } from "react";

type Theme = "warm" | "midnight" | "trail";
type View = "Today" | "Plan" | "Coach" | "Connections";

const nav: { label: View; icon: string }[] = [
  { label: "Today", icon: "⌂" }, { label: "Plan", icon: "▦" },
  { label: "Coach", icon: "✦" }, { label: "Connections", icon: "↗" },
];

const themes: { id: Theme; name: string; color: string }[] = [
  { id: "warm", name: "Warm", color: "#ff5b4d" },
  { id: "midnight", name: "Midnight", color: "#35dbc7" },
  { id: "trail", name: "Trail", color: "#397d43" },
];

function Ring({ value, label, small = false }: { value: number; label: string; small?: boolean }) {
  return <div className={`ring ${small ? "ring-small" : ""}`} style={{ "--score": `${value * 3.6}deg` } as React.CSSProperties}>
    <div><strong>{value}</strong><span>{label}</span></div>
  </div>;
}

function Source({ mark, name, detail }: { mark: string; name: string; detail: string }) {
  return <button className="source-row"><span className={`source-mark ${name.toLowerCase().split(" ")[0]}`}>{mark}</span><span><b>{name}</b><small>{detail}</small></span><i>Connected</i><em>›</em></button>;
}

function TodayView({ onStart }: { onStart: () => void }) {
  return <>
    <section className="hero-grid">
      <article className="card workout-card">
        <div className="eyebrow"><span>Today’s workout</span><span className="pill">Key session</span></div>
        <h2>Progression run <span>· 50 min</span></h2>
        <p className="workout-note">Build smoothly from conversational to strong. You’re well recovered, so the final 10 minutes can be purposeful.</p>
        <div className="pace-graph" aria-label="Workout intensity rises across four stages">
          <div style={{height:"34%"}}><b>10 min</b><span>Easy</span></div><div style={{height:"51%"}}><b>15 min</b><span>Steady</span></div><div style={{height:"70%"}}><b>15 min</b><span>Tempo</span></div><div style={{height:"88%"}}><b>10 min</b><span>Strong</span></div>
        </div>
        <div className="workout-meta"><span><b>5.8 mi</b> estimated</span><span><b>Moderate</b> load</span><span><b>Aerobic</b> focus</span></div>
        <button className="primary" onClick={onStart}>▶ &nbsp; Start workout</button>
      </article>
      <article className="card readiness-card">
        <div className="card-head"><h3>Readiness</h3><button aria-label="Readiness information">ⓘ</button></div>
        <Ring value={82} label="Ready to build" />
        <p>Sleep and HRV are above your baseline. A quality session fits today.</p>
        <div className="mini-stats"><span><b>7h 32m</b><small>Sleep</small></span><span><b>78 ms</b><small>HRV</small></span><span><b>48</b><small>Resting HR</small></span></div>
      </article>
      <article className="card environment-card">
        <div className="card-head"><h3>Best window</h3><span className="live-dot">Live</span></div>
        <div className="weather-row"><span className="weather-icon">☀</span><div><strong>6:30–8:00 AM</strong><small>Best outdoor conditions</small></div></div>
        <div className="condition-grid"><span><b>64°</b><small>Temperature</small></span><span><b>34</b><small>AQI · Good</small></span><span><b>6 mph</b><small>Wind</small></span><span><b>42%</b><small>Humidity</small></span></div>
        <div className="coach-note"><b>Outdoor recommended</b><p>Low smoke risk and cool conditions. Air quality may worsen after 2 PM.</p></div>
        <button className="text-button">View hourly outlook <span>→</span></button>
      </article>
    </section>
    <section className="lower-grid">
      <article className="card load-card"><div className="card-head"><div><h3>Weekly load</h3><p>Right where you want to be</p></div><b className="load-number">412 <small>/ 450–550</small></b></div><div className="chart-bars">{[38,58,47,66,82,44,73].map((v,i)=><div key={i}><span style={{height:`${v}%`}}></span><small>{["M","T","W","T","F","S","S"][i]}</small></div>)}</div><div className="chart-footer"><span><i></i> Current load</span><span><i></i> Target range</span><b>↑ 8% vs last week</b></div></article>
      <article className="card race-card"><div className="eyebrow">Goal race</div><h3>Santa Cruz Half</h3><div className="race-center"><Ring value={68} label="Plan complete" small /><div><strong>9 weeks</strong><span>September 20, 2026</span></div></div><div className="race-stats"><span><b>1:38:00</b><small>Goal</small></span><span><b>7:29/mi</b><small>Goal pace</small></span></div><button className="text-button">Open race plan <span>→</span></button></article>
      <article className="card recovery-card"><div className="card-head"><h3>Recovery insight</h3><span>☾</span></div><h4>Strong recovery detected.</h4><p>Your body is responding well. Add 10–15 minutes of mobility after today’s run.</p><div className="signals"><span><b>Low</b> muscle soreness</span><span><b>Good</b> energy</span><span><b>Stable</b> sleep trend</span></div></article>
    </section>
  </>;
}

function PlanView() {
  const [race, setRace] = useState("Half marathon"); const [days, setDays] = useState("4");
  return <section className="feature-layout"><article className="card plan-builder"><div className="eyebrow">Adaptive race planner</div><h2>Build toward your next start line.</h2><p>Pick the target. RunFormance shapes the running, strength, recovery, and cross-training around your real life.</p><div className="form-grid"><label>Race distance<select value={race} onChange={e=>setRace(e.target.value)}><option>5K</option><option>10K</option><option>Half marathon</option><option>Marathon</option><option>Ultra</option></select></label><label>Race date<input type="date" defaultValue="2026-09-20" /></label><label>Run days per week<select value={days} onChange={e=>setDays(e.target.value)}><option>3</option><option>4</option><option>5</option><option>6</option></select></label><label>Primary goal<select><option>Finish strong</option><option>Set a PR</option><option>Return to racing</option></select></label></div><button className="primary">Create my {race} plan</button></article><article className="card week-card"><div className="card-head"><h3>This week</h3><span>Week 4 of 13</span></div>{[["Mon","Easy run","35 min"],["Tue","Strength + mobility","40 min"],["Wed","Progression run","50 min"],["Thu","Indoor cycling","45 min"],["Fri","Recovery","Rest"],["Sat","Long run","9 miles"],["Sun","Yoga or walk","30 min"]].map((x,i)=><div className={`day-row ${i===2?"today-row":""}`} key={x[0]}><b>{x[0]}</b><span>{x[1]}</span><small>{x[2]}</small></div>)}</article></section>;
}

function CoachView() {
  const [message,setMessage]=useState(""); const [chat,setChat]=useState<string[]>([]);
  return <section className="feature-layout coach-layout"><article className="card coach-panel"><div className="coach-avatar">✦</div><div><div className="eyebrow">RunFormance coach</div><h2>Training that adjusts with you.</h2><p>I combine your recent load, recovery, schedule, race goal, and local conditions—then explain the recommendation.</p></div><div className="suggestions"><button onClick={()=>setMessage("Can I swap today’s run for cycling?")}>Swap today’s workout</button><button onClick={()=>setMessage("Why is my readiness 82?")}>Explain my readiness</button><button onClick={()=>setMessage("Adjust my week around travel")}>Plan around travel</button></div><div className="chat-history">{chat.map((x,i)=><div key={i} className={i%2?"bot":"user"}>{x}</div>)}</div><form onSubmit={e=>{e.preventDefault(); if(message){setChat([...chat,message,"Yes. A 50-minute Zone 2 ride preserves the aerobic goal with less impact. I’ll move the progression run to Friday, when recovery and air quality both look favorable."]);setMessage("")}}}><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ask about training, recovery, or your plan…"/><button>Send</button></form></article><article className="card principles"><h3>Today’s decision</h3><div className="decision-score"><Ring value={82} label="Go" small/></div><h4>Why this workout?</h4><ul><li>Acute load is within your optimal range</li><li>HRV is 9% above your 30-day baseline</li><li>You had 48 hours since your last hard effort</li><li>Morning AQI supports outdoor training</li></ul><p className="fine-print">Recommendations are educational and do not replace medical advice.</p></article></section>;
}

function ConnectionsView() {
  const [location,setLocation]=useState(true); const [alerts,setAlerts]=useState(true);
  return <section className="feature-layout"><article className="card connection-list"><div className="eyebrow">Your data</div><h2>One view of your whole training life.</h2><p>Connect the services you choose. You control what is shared and can disconnect at any time.</p><Source mark="♥" name="Apple Health" detail="Sleep, HRV, workouts · synced 2 min ago"/><Source mark="G" name="Garmin Connect" detail="Training load, recovery, activities · synced 3 min ago"/><Source mark="▲" name="Strava" detail="Activities, routes, segments · synced 2 min ago"/><button className="add-source">＋ Add another source</button></article><article className="card privacy-card"><div className="card-head"><h3>Location & conditions</h3><span>Private by design</span></div><p>Use approximate location for hyperlocal workout guidance. Precise workout routes are never required.</p><label className="toggle-row"><span><b>Local conditions</b><small>Weather, AQI, smoke, heat, UV and pollen</small></span><input type="checkbox" checked={location} onChange={e=>setLocation(e.target.checked)}/><i></i></label><label className="toggle-row"><span><b>Rapid-change alerts</b><small>Notify me when conditions change before a workout</small></span><input type="checkbox" checked={alerts} onChange={e=>setAlerts(e.target.checked)}/><i></i></label><div className="location-preview"><b>Yuba City, California</b><span>Approximate location · updated 12 min ago</span><button>Change</button></div><div className="privacy-note">Your health and location data is used only to personalize recommendations. It is never sold.</div></article></section>;
}

export default function Home() {
  const [theme,setTheme]=useState<Theme>(() => typeof window === "undefined" ? "warm" : (localStorage.getItem("runformance-theme") as Theme) || "warm"); const [view,setView]=useState<View>("Today"); const [modal,setModal]=useState(false);
  useEffect(()=>{ document.documentElement.dataset.theme=theme; localStorage.setItem("runformance-theme",theme); },[theme]);
  const subtitle=useMemo(()=>view==="Today"?"Your training, recovery, and conditions—working together.":view==="Plan"?"A plan that flexes without losing the goal.":view==="Coach"?"Ask why, change course, keep moving forward.":"Bring your signals together. Keep control of your data.",[view]);
  return <div className="app-shell">
    <aside><div className="brand"><span className="brand-mark">RF</span><b>RunFormance</b></div><nav>{nav.map(n=><button key={n.label} className={view===n.label?"active":""} onClick={()=>setView(n.label)}><i>{n.icon}</i>{n.label}</button>)}</nav><div className="sidebar-quote"><span>✦</span><p>Better runs.<br/>Better recovery.</p><small>Better health.</small></div><div className="profile"><span>AM</span><div><b>Alex Morgan</b><small>View profile</small></div><em>⌄</em></div></aside>
    <main><div className="demo-banner"><span>Build Week demo</span><p>Representative sample data</p></div><header><div><p className="mobile-brand">RunFormance</p><h1>{view==="Today"?"Good morning, Alex":view}</h1><p>{subtitle}</p></div><div className="header-actions"><div className="theme-switcher" aria-label="Choose appearance">{themes.map(t=><button key={t.id} className={theme===t.id?"selected":""} onClick={()=>setTheme(t.id)} title={`${t.name} theme`}><i style={{background:t.color}}></i><span>{t.name}</span></button>)}</div><button className="bell" aria-label="Notifications">♢<i></i></button><span className="avatar">AM</span></div></header>
      {view==="Today"&&<TodayView onStart={()=>setModal(true)}/>} {view==="Plan"&&<PlanView/>} {view==="Coach"&&<CoachView/>} {view==="Connections"&&<ConnectionsView/>}
    </main>
    <nav className="mobile-nav">{nav.map(n=><button key={n.label} className={view===n.label?"active":""} onClick={()=>setView(n.label)}><i>{n.icon}</i><span>{n.label}</span></button>)}</nav>
    {modal&&<div className="modal-backdrop" onMouseDown={()=>setModal(false)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setModal(false)}>×</button><div className="coach-avatar">▶</div><div className="eyebrow">Ready when you are</div><h2>Progression run · 50 min</h2><p>We’ll guide each stage with pace and effort cues. Your watch will receive the workout automatically.</p><div className="modal-stats"><span><b>82</b> readiness</span><span><b>34</b> AQI</span><span><b>64°F</b> outside</span></div><button className="primary" onClick={()=>setModal(false)}>Send to Garmin & start</button><button className="secondary" onClick={()=>setModal(false)}>Start without a device</button></div></div>}
  </div>;
}


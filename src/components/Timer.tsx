import React, { useEffect, useRef, useState } from 'react'
export type Relaxant = 'atracurium'|'vecuronium'

type Phase = 'bolus'|'maintenance'

type StartOpts = { drug: Relaxant, phase?: Phase, maintenanceMin?: number }
const now = ()=>Date.now()

export default function Timer(){
  const [startMs, setStart] = useState<number>(()=>Number(localStorage.getItem('rt_start'))||0)
  const [running, setRun] = useState<boolean>(()=>localStorage.getItem('rt_running')==='1')
  const [phase, setPhase] = useState<Phase>(()=> (localStorage.getItem('rt_phase') as Phase)||'bolus')
  const [drug, setDrug] = useState<Relaxant>(()=> (localStorage.getItem('rt_drug') as Relaxant)||'atracurium')
  const [maintMin, setMaint] = useState<number>(()=>Number(localStorage.getItem('rt_maintMin'))||20)
  const tick = useForceTick(running)

  useEffect(()=>localStorage.setItem('rt_start', String(startMs)),[startMs])
  useEffect(()=>localStorage.setItem('rt_running', running?'1':'0'),[running])
  useEffect(()=>localStorage.setItem('rt_phase', phase),[phase])
  useEffect(()=>localStorage.setItem('rt_drug', drug),[drug])
  useEffect(()=>localStorage.setItem('rt_maintMin', String(maintMin)),[maintMin])

  const elapsed = ()=> running && startMs ? now()-startMs : 0
  function startTimer(o?: StartOpts){ if(o?.drug) setDrug(o.drug); if(o?.maintenanceMin) setMaint(o.maintenanceMin); setPhase(o?.phase||'bolus'); setStart(now()); setRun(true) }
  function pause(){ setRun(false) }
  function clear(){ setRun(false); setStart(0) }
  function restartMaint(){ setPhase('maintenance'); setStart(now()); setRun(true) }

  const {mm, ss} = toMMSS(elapsed()); void tick

  return (
    <section className="w-full px-3 pb-28">
      <h2 className="text-xl font-semibold mt-3">Relaxant stopwatch</h2>
      <div className="mt-2 inline-flex items-baseline gap-2">
        <div className="text-4xl tabular-nums" aria-live="polite">{mm}:{ss}</div>
        <span className="px-2 py-0.5 rounded bg-gray-100 text-xs">{drug} · {phase}</span>
      </div>
      <div className="mt-3 flex gap-2">
        {!running && <button className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white" onClick={()=>startTimer({drug, phase})}>Start</button>}
        {running && <button className="px-3 py-1.5 text-sm rounded bg-gray-200" onClick={pause}>Pause</button>}
        <button className="px-3 py-1.5 text-sm rounded bg-gray-200" onClick={clear}>Clear</button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white" onClick={restartMaint}>Top up now & Restart</button>
        <button className="px-3 py-1.5 text-sm rounded bg-rose-600 text-white" onClick={clear}>Remove</button>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm">Maintenance window (min)</label>
        <input type="number" className="w-20 border rounded px-2 py-1 text-sm" value={maintMin} onChange={e=>setMaint(Number(e.target.value)||20)} />
        <button className="px-3 py-1 text-sm rounded border" onClick={()=>startTimer({drug, phase:'bolus', maintenanceMin: maintMin})}>Give & start timer</button>
      </div>
      <ScriptBridge onMount={(fn)=>{ (window as any).__startRelaxant = (d:Relaxant,m:number)=>fn({drug:d, phase:'bolus', maintenanceMin:m}); return ()=>{ delete (window as any).__startRelaxant } }} startFn={startTimer} />
    </section>
  )
}

function toMMSS(ms:number){ const t=Math.floor(ms/1000); return { mm:String(Math.floor(t/60)).padStart(2,'0'), ss:String(t%60).padStart(2,'0') } }
function useForceTick(active:boolean){ const [,setN]=useState(0); const r=useRef<number>(); useEffect(()=>{ if(!active){ if(r.current) cancelAnimationFrame(r.current); return } let raf:number; const loop=()=>{ setN(n=>n+1); raf=requestAnimationFrame(loop) }; raf=requestAnimationFrame(loop); r.current=raf; return ()=>cancelAnimationFrame(raf) },[active]); return null }
function ScriptBridge({onMount,startFn}:{onMount:(fn:(o:StartOpts)=>void)=>()=>void,startFn:(o?:StartOpts)=>void}){ useEffect(()=>onMount(startFn),[]); return null }

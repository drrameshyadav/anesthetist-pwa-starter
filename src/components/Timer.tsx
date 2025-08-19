import React, { useEffect, useRef, useState } from 'react'

export type Relaxant = 'atracurium' | 'vecuronium'

type Phase = 'bolus' | 'maintenance'

type StartOpts = {
  drug: Relaxant,
  phase?: Phase,
  maintenanceMin?: number
}

function now() { return Date.now() }

export default function Timer() {
  // Persisted across reloads
  const [startMs, setStartMs] = useState<number>(() => Number(localStorage.getItem('rt_start')) || 0)
  const [running, setRunning] = useState<boolean>(() => localStorage.getItem('rt_running') === '1')
  const [phase, setPhase] = useState<Phase>(() => (localStorage.getItem('rt_phase') as Phase) || 'bolus')
  const [drug, setDrug] = useState<Relaxant>(() => (localStorage.getItem('rt_drug') as Relaxant) || 'atracurium')
  const [maintMin, setMaintMin] = useState<number>(() => Number(localStorage.getItem('rt_maintMin')) || 20)

  const tick = useForceTick(running)

  useEffect(() => { localStorage.setItem('rt_start', String(startMs)) }, [startMs])
  useEffect(() => { localStorage.setItem('rt_running', running ? '1' : '0') }, [running])
  useEffect(() => { localStorage.setItem('rt_phase', phase) }, [phase])
  useEffect(() => { localStorage.setItem('rt_drug', drug) }, [drug])
  useEffect(() => { localStorage.setItem('rt_maintMin', String(maintMin)) }, [maintMin])

  function elapsedMs() { return running && startMs ? now() - startMs : 0 }

  function startTimer(opts?: StartOpts) {
    if (opts?.drug) setDrug(opts.drug)
    if (opts?.maintenanceMin) setMaintMin(opts.maintenanceMin)
    setPhase(opts?.phase || 'bolus')
    setStartMs(now())
    setRunning(true)
  }
  function stopTimer() { setRunning(false) }
  function clearTimer() { setRunning(false); setStartMs(0) }
  function restartMaintenance() { setPhase('maintenance'); setStartMs(now()); setRunning(true) }

  const ms = elapsedMs(); void tick // re-render while running
  const { mm, ss } = msToMMSS(ms)

  const defaultMaint = drug === 'atracurium' ? 20 : 30 // placeholder defaults

  return (
    <section className="w-full px-3 pb-24">
      <h2 className="text-xl font-semibold mt-3">Relaxant stopwatch</h2>

      <div className="mt-2 inline-flex items-baseline gap-2">
        <div className="text-4xl tabular-nums" aria-live="polite">{mm}:{ss}</div>
        <span className="px-2 py-0.5 rounded bg-gray-100 text-xs">{drug} · {phase}</span>
      </div>

      <div className="mt-3 flex gap-2">
        {!running && <button className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white" onClick={()=>startTimer({ drug, phase })}>Start</button>}
        {running && <button className="px-3 py-1.5 text-sm rounded bg-gray-200" onClick={stopTimer}>Pause</button>}
        <button className="px-3 py-1.5 text-sm rounded bg-gray-200" onClick={clearTimer}>Clear</button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white" onClick={restartMaintenance}>
          Top up now & Restart
        </button>
        <button className="px-3 py-1.5 text-sm rounded bg-rose-600 text-white" onClick={clearTimer}>
          Remove
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label className="text-sm">Maintenance window (min)</label>
        <input type="number" className="w-20 border rounded px-2 py-1 text-sm" value={maintMin}
          onChange={e=>setMaintMin(Number(e.target.value)||defaultMaint)} />
        <button className="px-3 py-1 text-sm rounded border" onClick={()=>startTimer({ drug, phase:'bolus', maintenanceMin: maintMin })}>
          Give & start timer
        </button>
      </div>

      <details className="mt-4">
        <summary className="text-sm text-gray-500">Hook: external components can call `window.__startRelaxant`</summary>
        <code className="block text-xs bg-gray-50 p-2 rounded">window.__startRelaxant?.('atracurium', 20)</code>
      </details>

      {/* expose a global hook so SyringeCards can start us */}
      <ScriptBridge onMount={(fn)=>{
        (window as any).__startRelaxant = (drug: Relaxant, maint: number)=> fn({drug, phase:'bolus', maintenanceMin: maint})
        return ()=>{ delete (window as any).__startRelaxant }
      }} startFn={startTimer} />
    </section>
  )
}

function msToMMSS(ms: number){
  const total = Math.floor(ms/1000)
  const mm = String(Math.floor(total/60)).padStart(2,'0')
  const ss = String(total%60).padStart(2,'0')
  return { mm, ss }
}

function useForceTick(active: boolean){
  const [, setN] = useState(0)
  const ref = useRef<number>()
  useEffect(()=>{
    if(!active){ if(ref.current) cancelAnimationFrame(ref.current); return }
    let raf: number
    const loop = ()=>{ setN(n=>n+1); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    ref.current = raf
    return ()=> cancelAnimationFrame(raf)
  }, [active])
  return null
}

function ScriptBridge({ onMount, startFn }: { onMount:(fn:(o: StartOpts)=>void)=>()=>void, startFn:(o?:StartOpts)=>void }){
  useEffect(()=> onMount(startFn), [])
  return null
}

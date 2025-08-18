import React, { useEffect, useMemo, useRef, useState } from 'react'
import { storage } from '../lib/storage'
import { derivePatient, type PatientState } from '../lib/patient'

type AgentKey = 'roc' | 'vec' | 'atracurium' | 'cisatracurium'

type Agent = {
  key: AgentKey
  label: string
  defaultMin: number
  range: string
}

const AGENTS: Agent[] = [
  { key: 'roc',            label: 'Rocuronium',          defaultMin: 40, range: '30–60 min' },
  { key: 'vec',            label: 'Vecuronium',          defaultMin: 35, range: '25–40 min' },
  { key: 'atracurium',     label: 'Atracurium',          defaultMin: 30, range: '20–35 min' },
  { key: 'cisatracurium',  label: 'Cisatracurium',       defaultMin: 40, range: '30–50 min' },
]

// Typical maintenance (top-up) dose ranges and default concentrations (common products)
// These are for *maintenance*, not intubating doses.
const MAINT_DOSE_MGKG: Record<AgentKey, { min: number; max: number }> = {
  roc: { min: 0.1, max: 0.2 },
  vec: { min: 0.01, max: 0.02 },
  atracurium: { min: 0.1, max: 0.2 },
  cisatracurium: { min: 0.01, max: 0.02 },
}
// mg per mL (typical)
const CONC_MG_PER_ML: Record<AgentKey, number> = {
  roc: 10,          // 10 mg/mL
  vec: 1,           // 1 mg/mL (after reconstitution)
  atracurium: 10,   // 10 mg/mL
  cisatracurium: 2, // 2 mg/mL
}

const now = () => Date.now()
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))
const fmt = (ms: number) => {
  const neg = ms < 0
  const t = Math.abs(ms)
  const s = Math.floor(t / 1000)
  const mm = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${neg ? '-' : ''}${mm}:${ss}`
}

function useBeeper() {
  const ctxRef = useRef<AudioContext | null>(null)
  const beep = () => {
    try {
      // Some Androids need a user gesture first; once timers are interacted with, this will work.
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const ctx = ctxRef.current!
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 1000
      g.gain.value = 0.06
      o.connect(g); g.connect(ctx.destination)
      o.start()
      setTimeout(() => { o.stop(); o.disconnect(); g.disconnect() }, 250)
    } catch {}
  }
  return beep
}

function vibrate(pattern: number | number[] = [80, 40, 80]) {
  try { if (navigator.vibrate) navigator.vibrate(pattern as any) } catch {}
}

type TimerItem = {
  id: string
  agent: AgentKey
  startedAt: number
  durationMs: number
  topUps: number
  lastTopUpAt?: number
  silenced?: boolean
}

const KEY = 'relaxant_timers_v2'
const PATIENT_KEY = 'atk_patient_v136' // same as PatientCard

export default function RelaxantTimers() {
  // Read patient from storage to compute weight-based suggestions
  const patientState = storage.get<PatientState>(PATIENT_KEY, {
    age: '', weight: '', heightCm: '', heightIn: '', heightFt: '', heightIn2: '',
    heightUnit: 'cm', sex: 'male', weightBasis: 'AUTO'
  } as any)
  const p = derivePatient(patientState)
  const dosingWeightKg = (() => {
    switch (patientState.weightBasis) {
      case 'TBW': return p.weightKg
      case 'IBW': return p.ibw || p.weightKg
      case 'LBW': return p.lbw || p.weightKg
      default:    return p.weightKg
    }
  })()

  const [keepAwake, setKeepAwake] = useState(false)
  const wakeLockRef = useRef<any>(null)
  useEffect(() => {
    const request = async () => {
      try {
        if (!keepAwake) return
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
          const onVis = async () => {
            // Re-acquire when returning to the page
            if (document.visibilityState === 'visible' && keepAwake) {
              try { wakeLockRef.current = await (navigator as any).wakeLock.request('screen') } catch {}
            }
          }
          document.addEventListener('visibilitychange', onVis)
          return () => document.removeEventListener('visibilitychange', onVis)
        }
      } catch {}
    }
    const cleanup = request()
    return () => {
      Promise.resolve(cleanup).catch(()=>{})
      try { wakeLockRef.current?.release?.() } catch {}
      wakeLockRef.current = null
    }
  }, [keepAwake])

  const [agent, setAgent] = useState<AgentKey>('roc')
  const [minutes, setMinutes] = useState<number>(40)
  const [timers, setTimers] = useState<TimerItem[]>(() => storage.get<TimerItem[]>(KEY, []))
  const beep = useBeeper()

  useEffect(() => { storage.set(KEY, timers) }, [timers])

  // Tick UI every second
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const a = AGENTS.find(a => a.key === agent)!
    setMinutes(a.defaultMin)
  }, [agent])

  const startTimer = () => {
    const mins = clamp(minutes || 0, 1, 240)
    const item: TimerItem = {
      id: Math.random().toString(36).slice(2),
      agent,
      startedAt: now(),
      durationMs: mins * 60_000,
      topUps: 0,
    }
    setTimers(t => [item, ...t])
  }

  const topUpAndRestart = (id: string) => {
    setTimers(ts => ts.map(t => {
      if (t.id !== id) return t
      return {
        ...t,
        startedAt: now(),
        lastTopUpAt: now(),
        topUps: (t.topUps || 0) + 1,
        silenced: false, // re-enable alert for the next due point
      }
    }))
    beep(); vibrate()
  }

  const nudge = (id: string, deltaMin: number) => {
    setTimers(ts => ts.map(t => t.id === id
      ? { ...t, durationMs: clamp(t.durationMs + deltaMin * 60_000, 60_000, 240 * 60_000) }
      : t))
  }

  const remove = (id: string) => setTimers(ts => ts.filter(t => t.id !== id))

  const remaining = (t: TimerItem) => {
    return t.durationMs - (now() - t.startedAt)
  }

  // Alert when any due & not silenced
  useEffect(() => {
    const due = timers.some(t => remaining(t) <= 0 && !t.silenced)
    if (!due) return
    beep(); vibrate()
    const i = setInterval(() => { beep(); vibrate() }, 10_000)
    return () => clearInterval(i)
  }, [timers])

  const silence = (id: string) =>
    setTimers(ts => ts.map(t => t.id === id ? ({ ...t, silenced: true }) : t))

  const agentsByKey = useMemo(() => Object.fromEntries(AGENTS.map(a => [a.key, a])), [])

  // Compute per-agent practical top-up suggestion text
  function topUpText(a: AgentKey) {
    const wt = dosingWeightKg || 0
    if (!wt) return 'Enter patient weight to see top-up dose (mg and mL).'
    const { min, max } = MAINT_DOSE_MGKG[a]
    const conc = CONC_MG_PER_ML[a]
    const mgMin = +(wt * min).toFixed(1)
    const mgMax = +(wt * max).toFixed(1)
    const mlMin = +(mgMin / conc).toFixed(1)
    const mlMax = +(mgMax / conc).toFixed(1)
    return `${mgMin}–${mgMax} mg (${mlMin}–${mlMax} mL @ ${conc} mg/mL)`
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <h2 className="font-semibold">Relaxant Timers</h2>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={keepAwake} onChange={e => setKeepAwake(e.target.checked)} />
            Keep screen awake
          </label>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 grid sm:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Agent</span>
          <select className="px-3 py-2 border rounded-xl" value={agent} onChange={e => setAgent(e.target.value as AgentKey)}>
            {AGENTS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </label>

        <div className="sm:col-span-2 flex flex-col gap-1">
          <span className="text-sm text-gray-600">Duration (min)</span>
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={240} step={1}
                   className="px-3 py-2 border rounded-xl w-32"
                   value={minutes} onChange={e => setMinutes(Number(e.target.value))} />
            <span className="text-xs text-gray-500">
              Default: {AGENTS.find(a => a.key === agent)?.range}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Suggested top-up: <span className="font-medium">{topUpText(agent)}</span>
          </div>
        </div>

        <div className="flex items-end">
          <button onClick={startTimer} className="px-3 py-2 rounded-xl border bg-blue-600 text-white hover:bg-blue-700">
            Start timer
          </button>
        </div>
      </div>

      {/* Active timers list */}
      <div className="px-4 pb-4">
        {timers.length === 0 ? (
          <div className="text-sm text-gray-500">No active timers.</div>
        ) : (
          <ul className="grid gap-2">
            {timers.map(t => {
              const rem = remaining(t)
              const due = rem <= 0
              const a = agentsByKey[t.agent]
              const elapsed = t.durationMs - Math.max(0, rem)
              const progress = clamp(elapsed / t.durationMs, 0, 1)

              return (
                <li key={t.id} className={`border rounded-xl p-3 ${due ? 'bg-rose-50 border-rose-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{a?.label ?? t.agent}</div>
                    <div className="ml-auto text-sm tabular-nums">{fmt(rem)}</div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-gray-200 mt-2 overflow-hidden">
                    <div
                      className={`h-full ${due ? 'bg-rose-500' : 'bg-blue-500'}`}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>

                  <div className="mt-2 text-xs text-gray-600">
                    Target {(t.durationMs/60000).toFixed(0)} min • Top-ups: {t.topUps}{t.lastTopUpAt ? ` • Last top-up ${new Date(t.lastTopUpAt).toLocaleTimeString()}` : ''}
                  </div>

                  {/* Actions */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => topUpAndRestart(t.id)}
                      className="px-3 py-1 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700"
                      title="Record a maintenance dose now and restart this timer"
                    >
                      Top up now & Restart
                    </button>

                    <button onClick={() => nudge(t.id, +2)} className="px-3 py-1 rounded-lg border">+2 min</button>
                    <button onClick={() => nudge(t.id, -2)} className="px-3 py-1 rounded-lg border">-2 min</button>

                    {due && !t.silenced && (
                      <button onClick={() => silence(t.id)} className="px-3 py-1 rounded-lg bg-amber-100 border border-amber-300">
                        Silence alert
                      </button>
                    )}

                    <button onClick={() => remove(t.id)} className="px-3 py-1 rounded-lg text-white bg-rose-600 hover:bg-rose-700 ml-auto">
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="px-4 pb-4 text-xs text-gray-500">
        Typical maintenance ranges shown. Use clinical judgement, nerve stimulator/TOF, and local policy.
      </div>
    </div>
  )
}

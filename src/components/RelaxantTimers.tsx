import React, { useEffect, useRef, useState } from 'react'
import { AGENTS, type AgentKey } from '@/lib/relaxants'

type Phase = 'bolus' | 'maintenance'

type Timer = {
  id: string
  agent: AgentKey
  startedAt: number       // current cycle start
  bolusAt: number         // first-dose start (master stopwatch)
  targetMin: number
  phase: Phase
  silenced?: boolean
}

const now = () => Date.now()
const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m.toString().padStart(2,'0')}:${r.toString().padStart(2,'0')}`
}

const beep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'; o.frequency.value = 880
    o.connect(g); g.connect(ctx.destination)
    o.start(); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0)
    o.stop(ctx.currentTime + 1.0)
    if (navigator.vibrate) navigator.vibrate([180, 80, 180])
  } catch {}
}

function useWakeLock() {
  const lockRef = useRef<any>(null)
  useEffect(() => {
    let stop = false
    const req = async () => {
      try {
        if ('wakeLock' in navigator && (navigator as any).wakeLock?.request) {
          lockRef.current = await (navigator as any).wakeLock.request('screen')
        }
      } catch {}
      if (!stop) setTimeout(req, 60_000)
    }
    req()
    return () => { stop = true; try { lockRef.current?.release?.() } catch {} }
  }, [])
}

export default function RelaxantTimers() {
  useWakeLock()

  // weight only used to display maintenance dose ranges (mg and mL)
  const [weight, setWeight] = useState<number>(70)
  const [agent, setAgent] = useState<AgentKey>('rocuronium')
  const [timers, setTimers] = useState<Timer[]>([])

  // UI tick
  const [, setTick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(i)
  }, [])

  const info = AGENTS[agent]
  const [mgMin, mgMax] = info.maintDoseRangeMgPerKg
  const doseMgMin = +(weight * mgMin).toFixed(2)
  const doseMgMax = +(weight * mgMax).toFixed(2)
  const doseMlMin = +(doseMgMin / info.concMgPerMl).toFixed(2)
  const doseMlMax = +(doseMgMax / info.concMgPerMl).toFixed(2)

  function startBolus() {
    const t: Timer = {
      id: Math.random().toString(36).slice(2),
      agent,
      startedAt: now(),
      bolusAt: now(),
      targetMin: AGENTS[agent].bolusMinutesDefault,
      phase: 'bolus'
    }
    setTimers(prev => [t, ...prev])
  }

  function topUpAndRestart(id: string) {
    setTimers(prev => prev.map(t => t.id === id ? {
      ...t,
      startedAt: now(),
      targetMin: AGENTS[t.agent].maintMinutesDefault,
      phase: 'maintenance',
      silenced: false
    } : t))
    beep()
  }

  function removeTimer(id: string) {
    setTimers(prev => prev.filter(t => t.id !== id))
  }

  function silence(id: string) {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, silenced: true } : t))
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Relaxant Timers</h2>
        <p className="text-xs text-gray-500">S23-friendly: wake lock, beep & vibration. Guidance only — verify with TOF and local policy.</p>
      </div>

      <div className="p-4 grid sm:grid-cols-3 gap-3 items-end">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Weight (kg)</span>
          <input type="number" min="1" step="0.5" value={weight}
            onChange={e => setWeight(+e.target.value || 0)}
            className="border rounded-xl px-3 py-2" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Agent</span>
          <select value={agent} onChange={e => setAgent(e.target.value as AgentKey)}
            className="border rounded-xl px-3 py-2">
            {Object.values(AGENTS).map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
        </label>

        <button onClick={startBolus}
          className="rounded-2xl px-4 py-2 bg-blue-600 text-white font-medium hover:brightness-110">
          Start {info.label} (Bolus timer {info.bolusMinutesDefault} min)
        </button>

        <div className="sm:col-span-3 text-xs text-gray-700">
          Maintenance dose (display): <b>{doseMgMin}–{doseMgMax} mg</b> (<b>{doseMlMin}–{doseMlMax} mL @ {info.concMgPerMl} mg/mL</b>)
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {timers.length === 0 && <div className="text-gray-500">No timers yet.</div>}
        {timers.map(t => {
          const a = AGENTS[t.agent]
          const elapsed = now() - t.startedAt
          const total = t.targetMin * 60_000
          const left = Math.max(0, total - elapsed)
          const pct = Math.min(100, Math.round((elapsed / total) * 100))
          const sinceBolus = now() - t.bolusAt

          if (left === 0 && !t.silenced) beep()

          return (
            <div key={t.id} className={`rounded-2xl border p-4 shadow ${left===0 && !t.silenced ? 'bg-rose-50 border-rose-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{a.label} — {t.phase === 'bolus' ? 'Bolus' : 'Maintenance'}</div>
                  <div className="text-sm text-gray-600">Since first dose: <b>{fmt(sinceBolus)}</b></div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tabular-nums">{fmt(left)}</div>
                  <div className="text-xs text-gray-500">Target {t.targetMin} min</div>
                </div>
              </div>

              <div className="w-full h-3 bg-gray-200 rounded-xl overflow-hidden mt-3">
                <div className={`h-full ${left===0 && !t.silenced ? 'bg-rose-500' : 'bg-green-600'}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => topUpAndRestart(t.id)}
                  className="rounded-xl px-3 py-2 bg-emerald-600 text-white text-sm font-medium hover:brightness-110">
                  Top up now & Restart
                </button>

                {left===0 && !t.silenced && (
                  <button onClick={() => silence(t.id)} className="rounded-xl px-3 py-2 bg-amber-100 border border-amber-300 text-sm">
                    Silence alert
                  </button>
                )}

                <button onClick={() => removeTimer(t.id)}
                  className="rounded-xl px-3 py-2 bg-gray-700 text-white text-sm hover:brightness-110 ml-auto">
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

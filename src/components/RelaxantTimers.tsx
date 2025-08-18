import React, { useEffect, useMemo, useRef, useState } from 'react'
import { storage } from '../lib/storage'

type AgentKey = 'sux' | 'roc' | 'vec' | 'atracurium' | 'cisatracurium'

type Agent = {
  key: AgentKey
  label: string
  defaultMin: number     // default timer minutes (mid of duration range)
  range: string          // display-only (typical duration range)
}

const AGENTS: Agent[] = [
  { key: 'sux',            label: 'Succinylcholine',     defaultMin: 8,  range: '5–10 min' },
  { key: 'roc',            label: 'Rocuronium',          defaultMin: 40, range: '30–60 min' },
  { key: 'vec',            label: 'Vecuronium',          defaultMin: 35, range: '25–40 min' },
  { key: 'atracurium',     label: 'Atracurium',          defaultMin: 30, range: '20–35 min' },
  { key: 'cisatracurium',  label: 'Cisatracurium',       defaultMin: 40, range: '30–50 min' },
]

// --- util helpers ---
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

// --- beep without audio file (WebAudio) ---
function useBeeper() {
  const ctxRef = useRef<AudioContext | null>(null)
  const beep = () => {
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const ctx = ctxRef.current!
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 1000
      g.gain.value = 0.05
      o.connect(g); g.connect(ctx.destination)
      o.start()
      setTimeout(() => { o.stop(); o.disconnect(); g.disconnect() }, 250)
    } catch { /* ignore */ }
  }
  return beep
}

// --- state types ---
type TimerItem = {
  id: string
  agent: AgentKey
  startedAt: number  // epoch ms
  durationMs: number
  pausedAt?: number  // if paused
  note?: string
  silenced?: boolean
}

const KEY = 'relaxant_timers_v1'

export default function RelaxantTimers() {
  const [agent, setAgent] = useState<AgentKey>('roc')
  const [minutes, setMinutes] = useState<number>(40)
  const [timers, setTimers] = useState<TimerItem[]>(() => storage.get<TimerItem[]>(KEY, []))
  const beep = useBeeper()

  // persist
  useEffect(() => { storage.set(KEY, timers) }, [timers])

  // auto-tick UI every second
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // auto-set minutes when agent changes
  useEffect(() => {
    const a = AGENTS.find(a => a.key === agent)!
    setMinutes(a.defaultMin)
  }, [agent])

  // add a timer
  const startTimer = () => {
    const mins = clamp(minutes || 0, 1, 240)
    const item: TimerItem = {
      id: Math.random().toString(36).slice(2),
      agent,
      startedAt: now(),
      durationMs: mins * 60_000,
    }
    setTimers(t => [item, ...t])
  }

  const togglePause = (id: string) => {
    setTimers(ts => ts.map(t => {
      if (t.id !== id) return t
      if (t.pausedAt) {
        // resume
        const pausedDur = now() - t.pausedAt
        return { ...t, pausedAt: undefined, startedAt: t.startedAt + pausedDur }
      } else {
        // pause
        return { ...t, pausedAt: now() }
      }
    }))
  }

  const nudge = (id: string, deltaMin: number) => {
    setTimers(ts => ts.map(t => t.id === id
      ? { ...t, durationMs: clamp(t.durationMs + deltaMin * 60_000, 60_000, 8 * 60_0000) }
      : t))
  }

  const remove = (id: string) => setTimers(ts => ts.filter(t => t.id !== id))

  // remaining ms
  const remaining = (t: TimerItem) => {
    const anchor = t.pausedAt ?? now()
    return t.durationMs - (anchor - t.startedAt)
  }

  // beep if any due & not silenced (every ~10s)
  useEffect(() => {
    const due = timers.some(t => remaining(t) <= 0 && !t.silenced)
    if (!due) return
    beep()
    const i = setInterval(() => beep(), 10_000)
    return () => clearInterval(i)
  }, [timers])

  const silence = (id: string) =>
    setTimers(ts => ts.map(t => t.id === id ? ({ ...t, silenced: true }) : t))

  const agentsByKey = useMemo(() => Object.fromEntries(AGENTS.map(a => [a.key, a])), [])

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <h2 className="font-semibold">Relaxant Timers</h2>
      </div>

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
        </div>

        <div className="flex items-end">
          <button onClick={startTimer} className="px-3 py-2 rounded-xl border bg-blue-600 text-white hover:bg-blue-700">
            Start timer
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        {timers.length === 0 ? (
          <div className="text-sm text-gray-500">No active timers.</div>
        ) : (
          <ul className="grid gap-2">
            {timers.map(t => {
              const rem = remaining(t)
              const due = rem <= 0
              const a = agentsByKey[t.agent]
              return (
                <li key={t.id} className={`border rounded-xl p-3 ${due ? 'bg-rose-50 border-rose-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{a?.label ?? t.agent}</div>
                    <div className="ml-auto text-sm tabular-nums">{fmt(rem)}</div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Started {new Date(t.startedAt).toLocaleTimeString()} • Target {(t.durationMs/60000).toFixed(0)} min
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={() => togglePause(t.id)} className="px-2 py-1 rounded-lg border">
                      {t.pausedAt ? 'Resume' : 'Pause'}
                    </button>
                    <button onClick={() => nudge(t.id, +2)} className="px-2 py-1 rounded-lg border">+2 min</button>
                    <button onClick={() => nudge(t.id, -2)} className="px-2 py-1 rounded-lg border">-2 min</button>
                    {due && !t.silenced && (
                      <button onClick={() => silence(t.id)} className="px-2 py-1 rounded-lg border bg-amber-100">Silence</button>
                    )}
                    <button onClick={() => remove(t.id)} className="px-2 py-1 rounded-lg border ml-auto">Done</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="px-4 pb-4 text-xs text-gray-500">
        Timings are typical teaching ranges; always use clinical judgement and monitors (TOF, etc.).
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'

type AgentKey = 'lidocaine' | 'bupivacaine' | 'ropivacaine' | 'prilocaine'

type AgentInfo = {
  label: string
  plain: number       // max mg/kg without adrenaline
  withAdr: number     // max mg/kg with adrenaline (epinephrine)
  capPlain?: number   // optional absolute cap (mg)
  capAdr?: number
  typicalConcs: number[] // % options
}

const AGENTS: Record<AgentKey, AgentInfo> = {
  lidocaine: { label: 'Lidocaine (Lignocaine)',
    plain: 4.5, withAdr: 7,
    capPlain: 300, capAdr: 500,
    typicalConcs: [0.5, 1, 1.5, 2] },
  bupivacaine: { label: 'Bupivacaine',
    plain: 2.5, withAdr: 3,
    capPlain: 175, capAdr: 225,
    typicalConcs: [0.25, 0.5, 0.75] },
  ropivacaine: { label: 'Ropivacaine',
    plain: 3, withAdr: 3,              // epi often not used; keep same limit
    capPlain: 225, capAdr: 250,
    typicalConcs: [0.2, 0.5, 0.75] },
  prilocaine: { label: 'Prilocaine',
    plain: 6, withAdr: 8,
    capPlain: 400, capAdr: 600,
    typicalConcs: [0.5, 1, 2, 3, 4] },
}

type State = {
  weightKg: number
  agent: AgentKey
  withAdr: boolean
  concPct: number
  plannedVolMl: number
}

const KEY = 'la_calc_v1'

// Persist any state value to localStorage
function usePersistentState<T>(key: string, initial: T) {
  const [val, setVal] = useState<T>(() => storage.get<T>(key, initial))
  useEffect(() => { storage.set(key, val) }, [key, val])
  return [val, setVal] as const
}

export default function LocalAnestheticCalc() {
  const [state, setState] = usePersistentState<State>(KEY, {
    weightKg: 70,
    agent: 'bupivacaine',
    withAdr: false,
    concPct: 0.5,
    plannedVolMl: 20
  })

  const info = AGENTS[state.agent]
  const mgPerMl = state.concPct * 10 // 1% = 10 mg/mL

  const maxPerKg = state.withAdr ? info.withAdr : info.plain
  const cap = state.withAdr ? info.capAdr : info.capPlain
  const theoreticalMaxMg = state.weightKg * maxPerKg
  const effectiveMaxMg = cap ? Math.min(theoreticalMaxMg, cap) : theoreticalMaxMg
  const maxVolMl = mgPerMl > 0 ? effectiveMaxMg / mgPerMl : 0

  const plannedMg = mgPerMl * (state.plannedVolMl || 0)
  const overLimit = plannedMg > effectiveMaxMg

  // When agent changes, default concentration to a typical one
  useEffect(() => {
    if (!info.typicalConcs.includes(state.concPct)) {
      setState(s => ({ ...s, concPct: info.typicalConcs[0] }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.agent])

  const set = <K extends keyof State>(k: K) => (v: any) =>
    setState(s => ({ ...s, [k]: v }))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Weight (kg)</span>
          <input type="number" min={1} step={0.5} value={state.weightKg}
            onChange={e => set('weightKg')(Number(e.target.value))}
            className="px-3 py-2 border rounded-xl" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Agent</span>
          <select value={state.agent}
            onChange={e => set('agent')(e.target.value as AgentKey)}
            className="px-3 py-2 border rounded-xl">
            {Object.entries(AGENTS).map(([k, a]) => (
              <option key={k} value={k}>{a.label}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 mt-2">
          <input type="checkbox" checked={state.withAdr}
            onChange={e => set('withAdr')(e.target.checked)} />
          <span className="text-sm text-gray-700">With adrenaline (epinephrine)</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Concentration</span>
          <select value={state.concPct}
            onChange={e => set('concPct')(Number(e.target.value))}
            className="px-3 py-2 border rounded-xl">
            {info.typicalConcs.map(c => (
              <option key={c} value={c}>{c}% ({(c*10).toFixed(0)} mg/mL)</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Planned volume (mL)</span>
          <input type="number" min={0} step={0.5} value={state.plannedVolMl}
            onChange={e => set('plannedVolMl')(Number(e.target.value))}
            className="px-3 py-2 border rounded-xl" />
        </label>
      </div>

      <div className="rounded-xl border p-3 bg-gray-50">
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-600">mg/mL:</span> <strong>{mgPerMl.toFixed(0)}</strong></div>
          <div><span className="text-gray-600">Max mg/kg:</span> <strong>{maxPerKg}</strong></div>
          <div><span className="text-gray-600">Theoretical max (mg):</span> <strong>{theoreticalMaxMg.toFixed(0)}</strong></div>
          <div><span className="text-gray-600">Absolute cap used:</span> <strong>{cap ?? '—'}</strong></div>
          <div><span className="text-gray-600">Effective max (mg):</span> <strong>{effectiveMaxMg.toFixed(0)}</strong></div>
          <div><span className="text-gray-600">Max volume at this conc (mL):</span> <strong>{maxVolMl.toFixed(1)}</strong></div>
        </div>
      </div>

      <div className={`rounded-xl p-3 border ${overLimit ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50 border-emerald-300'}`}>
        <div className="text-sm">
          Planned dose: <strong>{plannedMg.toFixed(0)} mg</strong> from {state.plannedVolMl || 0} mL.
          {overLimit ? (
            <span className="text-rose-700 font-semibold"> Over limit — reduce volume or concentration.</span>
          ) : (
            <span className="text-emerald-700"> Within limit.</span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Reference values are common teaching numbers. Always follow hospital policy and patient specifics.
      </p>
    </div>
  )
}

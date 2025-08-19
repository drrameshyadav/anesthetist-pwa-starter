import React from 'react'
import { RELAXANT_EVENT, RELAXANT_DEFAULT_MINUTES, triggerRelaxantGive } from '../lib/relaxant'

type State = {
  running: boolean
  drug?: 'atracurium' | 'vecuronium'
  phase: 'bolus' | 'maintenance'
  startedAt?: number
  dueAt?: number
}

function fmt(t: number) {
  const s = Math.max(0, Math.floor(t / 1000))
  const mm = Math.floor(s/60).toString().padStart(2, '0')
  const ss = (s%60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export default function Timer() {
  const [state, setState] = React.useState<State>({ running: false, phase: 'bolus' })
  const [now, setNow] = React.useState<number>(() => Date.now())

  // tick so the clock moves
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [])

  // Listen to “Give” events from Syringe cards
  React.useEffect(() => {
    function onGive(e: any) {
      const drug = e.detail?.drug as State['drug']
      const nowT = Date.now()
      setState(prev => {
        const firstTime = !prev.running || prev.drug !== drug
        const phase = firstTime ? 'bolus' : 'maintenance'
        const minutes = RELAXANT_DEFAULT_MINUTES[drug ?? 'atracurium']
        return {
          running: true,
          drug,
          phase,
          startedAt: nowT,
          dueAt: nowT + minutes*60*1000,
        }
      })
    }
    window.addEventListener(RELAXANT_EVENT, onGive as any)
    return () => window.removeEventListener(RELAXANT_EVENT, onGive as any)
  }, [])

  const elapsed = state.startedAt ? now - state.startedAt : 0
  const toDue = state.dueAt ? state.dueAt - now : 0
  const pct = state.dueAt && state.startedAt ? Math.min(100, Math.max(0, (elapsed / (state.dueAt - state.startedAt)) * 100)) : 0

  if (!state.running) {
    return (
      <section className="rounded-2xl border bg-white p-3 shadow-sm">
        <h2 className="text-base font-semibold">Relaxant Timer</h2>
        <p className="text-sm text-gray-600 mt-1">Start here or press <em>Give</em> on a syringe card.</p>
        <div className="mt-2 flex gap-2">
          <button className="rounded-lg border px-2 py-1 text-sm bg-white" onClick={()=>triggerRelaxantGive('atracurium')}>Start Atracurium</button>
          <button className="rounded-lg border px-2 py-1 text-sm bg-white" onClick={()=>triggerRelaxantGive('vecuronium')}>Start Vecuronium</button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border bg-white p-3 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Relaxant Timer — {state.drug}</h2>
        <span className="text-xs text-gray-600">{state.phase}</span>
      </div>

      <div className="text-3xl font-mono mt-2">{fmt(elapsed)}</div>

      {state.dueAt && (
        <div className="mt-2">
          <div className="h-2 rounded bg-gray-200 overflow-hidden">
            <div className="h-2" style={{width: `${pct}%`}}></div>
          </div>
          <div className="text-xs text-gray-600 mt-1">Next due in ~ {fmt(toDue)}</div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button className="rounded-lg border px-2 py-1 text-sm bg-blue-600 text-white" onClick={() => state.drug && triggerRelaxantGive(state.drug)}>
          Top up now & Restart
        </button>
        <button className="rounded-lg border px-2 py-1 text-sm" onClick={() => setState({ running: false, phase: 'bolus' })}>
          Remove
        </button>
      </div>
    </section>
  )
}

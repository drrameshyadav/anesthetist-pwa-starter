import React, { useEffect, useRef, useState } from 'react'
import { storage } from '@/lib/storage'

type Lap = { t: number, delta: number }

type TimerState = {
  running: boolean
  startEpoch: number | null  // ms since epoch when last started
  elapsed: number            // accumulated ms excluding current run
  laps: Lap[]
}

const KEY = 'timerState_v1'

function format(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const centis = Math.floor((ms % 1000) / 10)
  return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(centis).padStart(2,'0')}`
}

export default function Timer() {
  const [state, setState] = useState<TimerState>(() => storage.get<TimerState>(KEY, {
    running: false,
    startEpoch: null,
    elapsed: 0,
    laps: []
  }))

  const [now, setNow] = useState<number>(() => performance.now())
  const raf = useRef<number | null>(null)

  // Persist
  useEffect(() => { storage.set(KEY, state) }, [state])

  // Ticker when running
  useEffect(() => {
    if (!state.running) return
    const tick = () => {
      setNow(performance.now())
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [state.running])

  // Adjust elapsed on visibility change (keeps correct time when backgrounded)
  useEffect(() => {
    const onVis = () => {
      if (state.running && state.startEpoch !== null) {
        // recompute elapsed including real wall time
        const realElapsed = Date.now() - state.startEpoch
        setState(s => ({ ...s, elapsed: s.elapsed, startEpoch: Date.now() - realElapsed }))
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [state.running, state.startEpoch])

  const current = state.running && state.startEpoch
    ? state.elapsed + (Date.now() - state.startEpoch)
    : state.elapsed

  const start = () => {
    if (state.running) return
    setState(s => ({ ...s, running: true, startEpoch: Date.now() }))
  }
  const stop = () => {
    if (!state.running || state.startEpoch === null) return
    const add = Date.now() - state.startEpoch
    setState(s => ({ ...s, running: false, startEpoch: null, elapsed: s.elapsed + add }))
  }
  const reset = () => {
    setState({ running: false, startEpoch: null, elapsed: 0, laps: [] })
  }
  const lap = () => {
    const t = current
    const prev = state.laps.length ? state.laps[state.laps.length - 1].t : 0
    const delta = t - prev
    setState(s => ({ ...s, laps: [...s.laps, { t, delta }] }))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-5xl font-mono tabular-nums text-center">{format(current)}</div>
      <div className="flex gap-2 justify-center">
        {!state.running ? (
          <button onClick={start} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Start</button>
        ) : (
          <button onClick={stop} className="px-4 py-2 rounded-xl bg-rose-600 text-white">Stop</button>
        )}
        <button onClick={lap} className="px-4 py-2 rounded-xl border">Lap</button>
        <button onClick={reset} className="px-4 py-2 rounded-xl border">Reset</button>
      </div>

      {state.laps.length > 0 && (
        <div className="mt-2">
          <div className="text-sm text-gray-600 mb-2">Laps</div>
          <ul className="max-h-48 overflow-auto divide-y">
            {state.laps.map((l, i) => (
              <li key={i} className="py-2 flex justify-between font-mono text-sm">
                <span className="text-gray-500">#{i+1}</span>
                <span>{format(l.delta)}</span>
                <span className="text-gray-700">{format(l.t)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

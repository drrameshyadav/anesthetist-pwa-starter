import React from 'react'
import { DRUGS, type DrugDef } from '../lib/drugs'

function getStoredWeight(): number {
  const keys = ['patient.weight.kg', 'patientWeightKg', 'patient_kg', 'weightKg']
  for (const k of keys) {
    const v = localStorage.getItem(k)
    if (v && !isNaN(Number(v))) return Number(v)
  }
  return 70
}
function round(v: number, dp = 1) { const p = Math.pow(10, dp); return Math.round(v * p) / p }

function doseText(drug: DrugDef, wtKg: number, concMgPerMl: number) {
  const [loPerKg, hiPerKg] = drug.rangePerKg ?? [0, 0]
  const unit = drug.unitPerKg
  const toMg = unit === 'mcg' ? 1 / 1000 : 1
  const loMg = loPerKg * wtKg * toMg
  const hiMg = hiPerKg * wtKg * toMg
  const loMl = concMgPerMl > 0 ? loMg / concMgPerMl : 0
  const hiMl = concMgPerMl > 0 ? hiMg / concMgPerMl : 0
  if (loPerKg === hiPerKg) {
    return { headline: `${loPerKg} ${unit}/kg`, mgStr: `${round(loMg, 2)} mg`, mlStr: `${round(loMl, 2)} mL` }
  }
  return { headline: `${loPerKg}–${hiPerKg} ${unit}/kg`, mgStr: `${round(loMg, 2)}–${round(hiMg, 2)} mg`, mlStr: `${round(loMl, 2)}–${round(hiMl, 2)} mL` }
}

export function DrugDoseCards() {
  const [wtKg, setWtKg] = React.useState(getStoredWeight())
  const [conc, setConc] = React.useState<Record<string, number>>(
    Object.fromEntries(DRUGS.map(d => [d.key, d.concDefaultMgPerMl])),
  )
  React.useEffect(() => { localStorage.setItem('patient.weight.kg', String(wtKg)) }, [wtKg])

  return (
    // Tighter gutters on phones; roomy on large screens
    <section className="mx-auto px-0 sm:px-2 md:px-2 lg:px-6 max-w-none lg:max-w-3xl">
      <h2 className="text-xl font-semibold mb-3">Drug Dose Quick Calculator</h2>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium">Weight (kg)</label>
        <input
          type="number"
          inputMode="decimal"
          className="w-28 rounded-lg border px-3 py-2"
          value={wtKg}
          min={1}
          step="0.5"
          onChange={e => setWtKg(Number(e.target.value || 0))}
        />
        <button
          type="button"
          className="ml-auto rounded-lg border px-3 py-2 text-sm"
          onClick={() => (navigator as any)?.vibrate?.(10)}
          aria-label="Haptic ping"
          title="Haptic ping"
        >
          Haptic
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {DRUGS.map(d => {
          const c = conc[d.key] ?? d.concDefaultMgPerMl
          const txt = doseText(d, wtKg, c)
          return (
            <article key={d.key} className="rounded-2xl border bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{d.label}</div>
                  <div className="text-xs text-gray-600">{d.role}</div>
                </div>
                <div className="text-xs text-gray-600">
                  <div className="font-medium">Vial conc</div>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-20 rounded-lg border px-2 py-1 text-sm"
                      value={c}
                      step="0.1"
                      onChange={e => setConc(v => ({ ...v, [d.key]: Number(e.target.value || 0) }))}
                    />
                    <span className="text-gray-500">mg/mL</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-sm">
                <div className="text-gray-600">{txt.headline}</div>
                <div className="mt-1">
                  <span className="font-medium">Dose:</span> {txt.mgStr} &nbsp;(<span className="font-medium">≈</span> {txt.mlStr})
                </div>
                {d.adultFixedNote && <div className="mt-1 text-xs text-gray-600">💡 {d.adultFixedNote}</div>}
                {d.notes && <div className="mt-1 text-xs text-gray-600">{d.notes}</div>}
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-lg border px-3 py-2 text-sm"
                  onClick={() => setConc(v => ({ ...v, [d.key]: d.concDefaultMgPerMl }))}
                >
                  Reset conc
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <p className="mt-4 text-[12px] leading-snug text-gray-600">
        For trained anesthesia professionals only. Calculators show common ranges and do not replace clinical judgment,
        neuromuscular monitoring, or local policy. Always cross-check doses with current labels/guidelines and patient context.
      </p>
    </section>
  )
}

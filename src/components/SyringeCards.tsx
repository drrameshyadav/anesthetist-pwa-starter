import React from 'react'
import { STOCKS, SYRINGES, type Group, type Unit, type WeightBasis } from '../lib/syringes'
import { ibwKg, lbwKg, type Sex } from '../lib/weights'

function useLS(key: string, initial: string = '') {
  const [v, setV] = React.useState<string>(() => localStorage.getItem(key) ?? initial)
  React.useEffect(() => { localStorage.setItem(key, v) }, [key, v])
  return [v, setV] as const
}

function unitToMg(n: number, u: Unit) { return u === 'mcg' ? n / 1000 : n }

function chooseWeight(basis: WeightBasis, tbw: number, ibw?: number, lbw?: number, fallback: number = tbw) {
  if (basis === 'TBW') return tbw
  if (basis === 'IBW') return ibw ?? fallback
  if (basis === 'LBW') return lbw ?? fallback
  return fallback // AUTO handled at per-drug level below
}

/** compute final concentration for a syringe (mg/mL) */
function finalConcMgPerMl(s: (typeof SYRINGES)[number], stock: typeof STOCKS, vecuConcOverride?: number): number {
  const finalVol = s.finalVolumeMl
  if (s.mode === 'target' && s.target) {
    const mg = unitToMg(s.target.amount, s.target.unit)
    return mg / finalVol
  }
  if (s.mode === 'fixed' && s.fixed) {
    // if single-drug fixed: just scaled stock; for multi (e.g., reversal), return primary component mg/mL for dosing (neostigmine)
    const totalMg: Record<string, number> = {}
    for (const f of s.fixed) {
      const conc = f.drugKey === 'vecuronium' && vecuConcOverride ? vecuConcOverride : stock[f.drugKey].mgPerMl
      totalMg[f.drugKey] = (totalMg[f.drugKey] ?? 0) + conc * f.volumeMl
    }
    const primary = s.doseConfig?.primaryDrugKey ?? (s.fixed.length === 1 ? s.fixed[0].drugKey : s.fixed[0].drugKey)
    const mg = totalMg[primary] ?? 0
    return mg / finalVol
  }
  return 0
}

/** display helper */
function fmt(n: number, dp = 2) { return Number.isFinite(n) ? n.toFixed(dp).replace(/\.00$/, '') : '—' }

export function SyringeCards() {
  const [tab, setTab] = React.useState<Group>('adult')

  // Patient info (shared with your Patient card if it already stores these keys)
  const [wStr] = useLS('patient.weight.kg', '')
  const [hStr] = useLS('patient.height.cm', '')
  const [sexStr] = useLS('patient.sex', '') // 'M' | 'F'

  const tbw = Number(wStr) || 70
  const h = Number(hStr) || 0
  const sex = (sexStr === 'M' || sexStr === 'F') ? (sexStr as Sex) : 'M'

  const ibw = h > 0 ? ibwKg(h, sex) : undefined
  const lbw = h > 0 ? lbwKg(tbw, h, sex) : undefined

  // Vecuronium only: allow stock conc edit (others locked to your practice)
  const [vecuConcStr, setVecuConcStr] = useLS('stock.vecuronium.mgml', String(STOCKS.vecuronium.mgPerMl))
  const vecuConc = Number(vecuConcStr) > 0 ? Number(vecuConcStr) : undefined

  const list = SYRINGES.filter(s => s.group === tab)

  return (
    <section className="px-3 pb-6">
      <div className="mb-3 flex gap-2">
        <button className={`rounded-lg px-3 py-2 text-sm border ${tab==='adult'?'bg-blue-600 text-white':'bg-white'}`} onClick={() => setTab('adult')}>Adult</button>
        <button className={`rounded-lg px-3 py-2 text-sm border ${tab==='peds'?'bg-blue-600 text-white':'bg-white'}`} onClick={() => setTab('peds')}>Pediatric</button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Syringes</h2>

      <div className="grid grid-cols-1 gap-3">
        {list.map(s => {
          const finalC = finalConcMgPerMl(s, STOCKS, vecuConc)
          const guide = s.doseConfig
          const autoBasis: WeightBasis =
            guide?.basis === 'AUTO'
              ? (['fentanyl','propofol','ketamine','midazolam'].includes(s.target?.drugKey ?? s.fixed?.[0]?.drugKey ?? '')
                  ? 'LBW'
                  : (['atracurium','vecuronium'].includes(s.target?.drugKey ?? s.fixed?.[0]?.drugKey ?? '')
                      ? 'IBW'
                      : 'TBW'))
              : (guide?.basis ?? 'TBW')

          const weightUsed = chooseWeight(autoBasis, tbw, ibw, lbw, tbw)

          // UI: editable per-kg dose (defaults provided)
          const [doseStr, setDoseStr] = React.useState<string>(String(guide?.defaultPerKg ?? ''))

          // calculate mL to administer
          let mlToGive: number | null = null
          if (guide && finalC > 0) {
            const perKg = Number(doseStr)
            if (!isNaN(perKg) && perKg > 0) {
              const mg = unitToMg(perKg, guide.unitPerKg) * weightUsed
              mlToGive = mg / finalC
            }
          }

          // for reversal mixtures, also show paired drug amount delivered at that volume
          let pairedInfo: React.ReactNode = null
          if (s.mode === 'fixed' && s.doseConfig?.primaryDrugKey && mlToGive != null) {
            const map: Record<string, number> = {}
            for (const f of s.fixed ?? []) {
              const c = f.drugKey === 'vecuronium' && vecuConc ? vecuConc : STOCKS[f.drugKey].mgPerMl
              map[f.drugKey] = (map[f.drugKey] ?? 0) + c * (f.volumeMl / s.finalVolumeMl) // mg per mL of mix
            }
            const delivered: Record<string, number> = {}
            Object.keys(map).forEach(k => { delivered[k] = map[k] * (mlToGive as number) })
            const others = Object.keys(delivered).filter(k => k !== s.doseConfig!.primaryDrugKey)
            if (others.length > 0) {
              pairedInfo = <div className="text-xs text-gray-600 mt-1">
                This also delivers {others.map((k, i) =>
                  <span key={k}>
                    {i>0?', ':''}{STOCKS[k].label} ~{fmt(delivered[k], 2)} mg
                  </span>
                )}
              </div>
            }
          }

          return (
            <article key={s.key} className="rounded-2xl border bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{s.label}</div>
                  <div className="text-xs text-gray-600">{s.group === 'adult' ? 'Adult' : 'Pediatric'}</div>
                  {s.note && <div className="text-xs text-yellow-700 mt-1">⚠ {s.note}</div>}
                </div>
                { (s.target?.drugKey === 'vecuronium' || s.fixed?.some(f => f.drugKey==='vecuronium')) && (
                  <div className="text-xs text-gray-600 text-right">
                    <div className="font-medium">Vecuronium conc (mg/mL)</div>
                    <input
                      type="number" step="0.1" className="w-24 rounded border px-2 py-1 mt-1"
                      value={vecuConcStr} onChange={e => setVecuConcStr(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="mt-2 text-sm">
                <div className="text-gray-700">
                  Final concentration ≈ <span className="font-medium">{fmt(finalC, 3)} mg/mL</span>
                </div>
              </div>

              {s.doseConfig && (
                <div className="mt-3 rounded-xl border bg-gray-50 p-3">
                  <div className="text-sm font-medium mb-2">Dose → mL calculator</div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <label>Weight basis:</label>
                    <span className="rounded border px-2 py-1 bg-white">{autoBasis}</span>
                    { (autoBasis!=='TBW' && (!h || !sexStr)) && (
                      <span className="text-xs text-yellow-700">Height/sex missing → fell back to TBW</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <label className="whitespace-nowrap">Dose:</label>
                    <input
                      type="number" inputMode="decimal" className="w-28 rounded border px-2 py-1 bg-white"
                      value={doseStr} onChange={e => setDoseStr(e.target.value)}
                    />
                    <span className="text-gray-600">{s.doseConfig.unitPerKg}/kg</span>
                    {s.doseConfig.rangePerKg && (
                      <span className="text-xs text-gray-500">
                        (range {s.doseConfig.rangePerKg[0]}–{s.doseConfig.rangePerKg[1]} {s.doseConfig.unitPerKg}/kg)
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm">
                    Using weight = <span className="font-medium">{fmt(weightUsed,1)} kg</span>
                    {mlToGive!=null ? (
                      <div className="mt-1">
                        Give <span className="font-semibold">{fmt(mlToGive,2)} mL</span> from this syringe
                      </div>
                    ) : (
                      <div className="mt-1 text-red-600">Enter a valid dose</div>
                    )}
                    {pairedInfo}
                  </div>
                </div>
              )}

              <p className="mt-3 text-[12px] leading-snug text-gray-600">
                For trained anesthesia professionals. Verify local vial strengths & protocols. Weight-basis uses:
                LBW for opioids/induction; IBW for non-depolarizing NMBAs; TBW for SCh and reversal/anticholinergics.
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

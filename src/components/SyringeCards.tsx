import React from 'react'
import { STOCKS, SYRINGES, type Group, type Unit, type WeightBasis } from '../lib/syringes'
import { ibwKg, lbwKg, type Sex } from '../lib/weights'
import { triggerRelaxantGive } from '../lib/relaxant'

function useLS(key: string, initial: string = '') {
  const [v, setV] = React.useState<string>(() => localStorage.getItem(key) ?? initial)
  React.useEffect(() => { localStorage.setItem(key, v) }, [key, v])
  return [v, setV] as const
}

function unitToMg(n: number, u: Unit) { return u === 'mcg' ? n / 1000 : n }
function fmt(n: number, dp = 2) { return Number.isFinite(n) ? n.toFixed(dp).replace(/\.00$/, '') : '—' }

function chooseWeight(basis: WeightBasis, tbw: number, ibw?: number, lbw?: number, fallback: number = tbw) {
  if (basis === 'TBW') return tbw
  if (basis === 'IBW') return ibw ?? fallback
  if (basis === 'LBW') return lbw ?? fallback
  return fallback
}

/** mg/mL for dosing math */
function finalConcMgPerMl(s: (typeof SYRINGES)[number], vecuConc?: number): {mgPerMl: number, primaryDrugKey: string} {
  const finalVol = s.finalVolumeMl
  if (s.mode === 'target' && s.target) {
    const mg = unitToMg(s.target.amount, s.target.unit)
    return { mgPerMl: mg / finalVol, primaryDrugKey: s.target.drugKey }
  }
  const totalMg: Record<string, number> = {}
  for (const f of s.fixed ?? []) {
    const c = f.drugKey === 'vecuronium' && vecuConc ? vecuConc : STOCKS[f.drugKey].mgPerMl
    totalMg[f.drugKey] = (totalMg[f.drugKey] ?? 0) + c * f.volumeMl
  }
  const primary = s.doseConfig?.primaryDrugKey ?? (s.fixed?.[0]?.drugKey ?? 'unknown')
  const mg = totalMg[primary] ?? 0
  return { mgPerMl: mg / finalVol, primaryDrugKey: primary }
}

export function SyringeCards() {
  const [tab, setTab] = React.useState<Group>('adult')

  const [wStr] = useLS('patient.weight.kg', '')
  const [hStr] = useLS('patient.height.cm', '')
  const [sexStr] = useLS('patient.sex', '')
  const tbw = Number(wStr) || 70
  const h = Number(hStr) || 0
  const sex = (sexStr === 'M' || sexStr === 'F') ? (sexStr as Sex) : 'M'
  const ibw = h > 0 ? ibwKg(h, sex) : undefined
  const lbw = h > 0 ? lbwKg(tbw, h, sex) : undefined

  const [vecuConcStr, setVecuConcStr] = useLS('stock.vecuronium.mgml', String(STOCKS.vecuronium.mgPerMl))
  const vecuConc = Number(vecuConcStr) > 0 ? Number(vecuConcStr) : undefined

  const list = SYRINGES.filter(s => s.group === tab)

  return (
    <section className="px-1 md:px-2">
      <div className="mb-2 flex gap-2">
        <button className={`rounded-lg px-3 py-2 text-sm border ${tab==='adult'?'bg-blue-600 text-white':'bg-white'}`} onClick={() => setTab('adult')}>Adult</button>
        <button className={`rounded-lg px-3 py-2 text-sm border ${tab==='peds'?'bg-blue-600 text-white':'bg-white'}`} onClick={() => setTab('peds')}>Pediatric</button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Syringes</h2>

      <div className="grid grid-cols-1 gap-2">
        {list.map(s => {
          const { mgPerMl: finalC, primaryDrugKey } = finalConcMgPerMl(s, vecuConc)

          // Auto weight-basis decision (same rule as before)
          const basis: WeightBasis =
            s.doseConfig?.basis === 'AUTO'
              ? (['fentanyl','propofol','ketamine','midazolam'].includes(primaryDrugKey) ? 'LBW'
                 : (['atracurium','vecuronium'].includes(primaryDrugKey) ? 'IBW' : 'TBW'))
              : (s.doseConfig?.basis ?? 'TBW')
          const weightUsed = chooseWeight(basis, tbw, ibw, lbw, tbw)

          // Per-kg dose
          const [doseStr, setDoseStr] = React.useState<string>(String(s.doseConfig?.defaultPerKg ?? ''))
          const range = s.doseConfig?.rangePerKg
          const low = range?.[0]
          const typical = s.doseConfig?.defaultPerKg
          const high = range?.[1]

          // Calculate mL to administer
          let mlToGive: number | null = null
          if (s.doseConfig && finalC > 0) {
            const perKg = Number(doseStr)
            if (!isNaN(perKg) && perKg > 0) {
              const mg = unitToMg(perKg, s.doseConfig.unitPerKg) * weightUsed
              mlToGive = mg / finalC
            }
          }

          // Display concentration units
          const showMicro = primaryDrugKey === 'fentanyl'
          const concDisplay = showMicro ? fmt(finalC * 1000, 1) + ' µg/mL' : fmt(finalC, 3) + ' mg/mL'

          return (
            <article key={s.key} className="rounded-2xl border bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{s.label}</div>
                  <div className="text-xs text-gray-600">{s.group === 'adult' ? 'Adult' : 'Pediatric'}</div>
                </div>

                { (primaryDrugKey === 'vecuronium') && (
                  <div className="text-xs text-gray-600 text-right">
                    <div className="font-medium">Vecuronium conc (mg/mL)</div>
                    <input
                      type="number" step="0.1" className="w-24 rounded border px-2 py-1 mt-1"
                      value={vecuConcStr} onChange={e => setVecuConcStr(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="mt-2 text-sm text-gray-700">
                Final concentration ≈ <span className="font-medium">{concDisplay}</span>
              </div>

              {s.doseConfig && (
                <div className="mt-3 rounded-xl border bg-gray-50 p-3">
                  <div className="text-sm font-medium mb-2">Dose → mL</div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-gray-600">Weight basis:</span>
                    <span className="rounded border px-2 py-0.5 bg-white">{basis}</span>
                    {(basis!=='TBW' && (!h || !sexStr)) && (
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

                    {/* Quick chips */}
                    <div className="flex gap-1 ml-2">
                      {typeof low==='number' && (
                        <button className="rounded-full border px-2 py-0.5 text-xs" onClick={()=>setDoseStr(String(low))}>Low</button>
                      )}
                      {typeof typical==='number' && (
                        <button className="rounded-full border px-2 py-0.5 text-xs" onClick={()=>setDoseStr(String(typical))}>Typical</button>
                      )}
                      {typeof high==='number' && (
                        <button className="rounded-full border px-2 py-0.5 text-xs" onClick={()=>setDoseStr(String(high))}>High</button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-sm">
                    Using weight = <span className="font-medium">{fmt(weightUsed,1)} kg</span>
                    {mlToGive!=null ? (
                      <div className="mt-1">
                        Give <span className="font-semibold">{fmt(mlToGive,2)} mL</span>
                      </div>
                    ) : (
                      <div className="mt-1 text-red-600">Enter a valid dose</div>
                    )}
                  </div>

                  {/* Give button hooks the Relaxant Timer for atracurium/vecuronium */}
                  {['atracurium','vecuronium'].includes(primaryDrugKey) && (
                    <div className="mt-3">
                      <button
                        className="rounded-xl border px-3 py-2 bg-blue-600 text-white"
                        onClick={() => triggerRelaxantGive(primaryDrugKey as any)}
                        disabled={mlToGive==null}
                      >
                        Give now & start/refresh Relaxant Timer
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

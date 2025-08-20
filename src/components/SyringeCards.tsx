import React from 'react'
import { STOCKS, SYRINGES, type Unit, type SyringeDef, type Group } from '../lib/syringes'

function unitToMg(amount: number, unit: Unit) {
  return unit === 'mcg' ? amount / 1000 : amount
}

function Card({ s, stockMap, onStockChange }: {
  s: SyringeDef
  stockMap: Record<string, number | ''>
  onStockChange: (drugKey: string, mgPerMl: number | '') => void
}) {
  const finalVol = s.finalVolumeMl
  let usedVol = 0
  let lines: React.ReactNode[] = []

  if (s.mode === 'target' && s.target) {
    const sc = stockMap[s.target.drugKey]
    let drawMl: number | null = null
    if (typeof sc === 'number' && sc > 0) {
      drawMl = unitToMg(s.target.amount, s.target.unit) / sc
      usedVol += drawMl
    }
    lines.push(
      <div key="t">
        <div className="text-sm"><span className="font-medium">{STOCKS[s.target.drugKey].label}</span> target <span className="font-medium">{s.target.amount} {s.target.unit}</span> in {finalVol} mL</div>
        <div className="text-xs text-gray-600 mt-1">
          Stock conc (mg/mL):&nbsp;
          <input
            type="number" inputMode="decimal" step="0.01"
            className="w-28 rounded border px-2 py-1"
            value={stockMap[s.target.drugKey] === '' ? '' : stockMap[s.target.drugKey]}
            onChange={e => onStockChange(s.target!.drugKey, e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <div className="text-sm mt-1">
          {drawMl != null && isFinite(drawMl)
            ? <>Draw <span className="font-medium">{drawMl.toFixed(2)} mL</span> {STOCKS[s.target.drugKey].label} + add NS to <span className="font-medium">{finalVol} mL</span></>
            : <span className="text-red-600">Enter stock concentration to compute draw volume</span>}
        </div>
        {typeof sc === 'number' && sc > 0 && (
          <div className="text-xs text-gray-600 mt-1">
            Final concentration ≈ {(unitToMg(s.target.amount, s.target.unit) / finalVol).toFixed(3)} mg/mL
          </div>
        )}
      </div>
    )
  }

  if (s.mode === 'fixed' && s.fixed) {
    lines.push(
      <div key="f" className="text-sm">
        {s.fixed.map((f, idx) => {
          const sc = stockMap[f.drugKey]
          let mg = (typeof sc === 'number' && sc > 0) ? sc * f.volumeMl : null
          usedVol += f.volumeMl
          return (
            <div key={idx} className="mt-1">
              Draw <span className="font-medium">{f.volumeMl} mL</span> {STOCKS[f.drugKey].label}
              <span className="text-xs text-gray-600">
                &nbsp;{typeof sc === 'number' && sc > 0 ? `(~${mg!.toFixed(2)} mg at ${sc} mg/mL)` : `(enter stock conc)`}
              </span>
              <div className="text-xs text-gray-600">
                Stock conc (mg/mL):&nbsp;
                <input
                  type="number" inputMode="decimal" step="0.01"
                  className="w-28 rounded border px-2 py-1"
                  value={stockMap[f.drugKey] === '' ? '' : stockMap[f.drugKey]}
                  onChange={e => onStockChange(f.drugKey, e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const topUp = Math.max(0, finalVol - usedVol)
  return (
    <article className="rounded-2xl border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold">{s.label}</div>
          <div className="text-xs text-gray-600">{s.group === 'adult' ? 'Adult' : 'Pediatric'}</div>
          {s.note && <div className="text-xs text-yellow-700 mt-1">⚠ {s.note}</div>}
        </div>
      </div>

      <div className="mt-2 space-y-2">{lines}</div>

      <div className="mt-2 text-sm">
        Add NS to <span className="font-medium">{finalVol.toFixed(1)} mL</span>
        {usedVol > finalVol && <span className="text-red-600 ml-2">Check volumes: exceed final volume</span>}
        {usedVol <= finalVol && <span className="text-gray-600 ml-2">({topUp.toFixed(2)} mL NS)</span>}
      </div>
    </article>
  )
}

export default function SyringeCards() {
  const [tab, setTab] = React.useState<Group>('adult')

  // LocalStorage-backed conc per stock drug, default to STOCKS.mgPerMl on first run
  const [conc, setConc] = React.useState<Record<string, number | ''>>(() => {
    const initial: Record<string, number | ''> = {}
    for (const key of Object.keys(STOCKS)) {
      const ls = localStorage.getItem(`stock.${key}.mgml`)
      const parsed = ls != null && ls !== '' && !isNaN(Number(ls)) ? Number(ls) : undefined
      // Use mgPerMl if defined in STOCKS; fall back to '' (user will enter)
      initial[key] = parsed ?? (STOCKS as any)[key]?.mgPerMl ?? ''
    }
    return initial
  })

  const changeConc = (drugKey: string, v: number | '') => {
    setConc(prev => {
      const next = { ...prev, [drugKey]: v }
      if (v === '' || v == null) localStorage.removeItem(`stock.${drugKey}.mgml`)
      else localStorage.setItem(`stock.${drugKey}.mgml`, String(v))
      return next
    })
  }

  const list = SYRINGES.filter(s => s.group === tab)

  return (
    <section className="px-3 pb-6">
      <div className="mb-3 flex gap-2">
        <button
          className={`rounded-lg px-3 py-2 text-sm border ${tab==='adult'?'bg-blue-600 text-white':'bg-white'}`}
          onClick={() => setTab('adult')}
        >Adult</button>
        <button
          className={`rounded-lg px-3 py-2 text-sm border ${tab==='peds'?'bg-blue-600 text-white':'bg-white'}`}
          onClick={() => setTab('peds')}
        >Pediatric</button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Syringes</h2>

      <div className="grid grid-cols-1 gap-3">
        {list.map(s => (
          <Card key={s.key} s={s} stockMap={conc} onStockChange={changeConc} />
        ))}
      </div>

      <p className="mt-4 text-[12px] leading-snug text-gray-600">
        For trained anesthesia professionals only. Recipes reflect your provided practice. Enter/confirm stock concentrations to display mg content.
        This app does not replace institutional protocols or clinical judgment.
      </p>
    </section>
  )
}

// Also expose a named export so existing imports like `{ SyringeCards }` continue to work.
export { SyringeCards }

import React from 'react'
import { STOCKS, SYRINGES, type Unit, type SyringeDef, type Group } from '../lib/syringes'

function unitToMg(amount: number, unit: Unit) {
  return unit === 'mcg' ? amount / 1000 : amount
}

function Card({ s }: { s: SyringeDef }) {
  const finalVol = s.finalVolumeMl
  let usedVol = 0
  let lines: React.ReactNode[] = []

  if (s.mode === 'target' && s.target) {
    const stock = (STOCKS as any)[s.target.drugKey] ?? {}
    const conc: number | undefined = typeof stock.mgPerMl === 'number' ? stock.mgPerMl : undefined

    let drawMl: number | null = null
    if (conc && conc > 0) {
      drawMl = unitToMg(s.target.amount, s.target.unit) / conc
      usedVol += drawMl
    }

    lines.push(
      <div key="t">
        <div className="text-sm">
          <span className="font-medium">{STOCKS[s.target.drugKey].label}</span> target{' '}
          <span className="font-medium">{s.target.amount} {s.target.unit}</span> in {finalVol} mL
        </div>

        {conc
          ? (
            <div className="text-xs text-gray-600 mt-1">
              Stock conc: <span className="font-medium">{conc} mg/mL</span> (fixed)
              {stock.note && <span className="ml-2 text-gray-500">{stock.note}</span>}
            </div>
          )
          : (
            <div className="text-xs text-gray-600 mt-1">
              <span className="font-medium">Powder / no fixed mg/mL</span>
              {stock.note && <span className="ml-2 text-gray-500">{stock.note}</span>}
            </div>
          )
        }

        <div className="text-sm mt-1">
          {drawMl != null && isFinite(drawMl)
            ? <>Draw <span className="font-medium">{drawMl.toFixed(2)} mL</span> {STOCKS[s.target.drugKey].label} + add NS to <span className="font-medium">{finalVol} mL</span></>
            : <span className="text-yellow-700">Stock concentration not defined (powder) — reconstitute per vial/amp guidelines</span>}
        </div>

        {conc && (
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
          const stock = (STOCKS as any)[f.drugKey] ?? {}
          const conc: number | undefined = typeof stock.mgPerMl === 'number' ? stock.mgPerMl : undefined
          let mg = conc ? conc * f.volumeMl : null
          usedVol += f.volumeMl
          return (
            <div key={idx} className="mt-1">
              Draw <span className="font-medium">{f.volumeMl} mL</span> {STOCKS[f.drugKey].label}{' '}
              {conc
                ? <span className="text-xs text-gray-600">&nbsp;(~{mg!.toFixed(2)} mg at {conc} mg/mL, fixed)</span>
                : <span className="text-xs text-gray-600">&nbsp;(powder; reconstitute — no fixed mg/mL)</span>
              }
              {stock.note && <div className="text-xs text-gray-500">{stock.note}</div>}
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
          <Card key={s.key} s={s} />
        ))}
      </div>

      <p className="mt-4 text-[12px] leading-snug text-gray-600">
        For trained anesthesia professionals only. Recipes reflect your provided practice.
        This app does not replace institutional protocols or clinical judgment.
      </p>
    </section>
  )
}

// keep default export
export { SyringeCards }  // <-- add named export to satisfy `import { SyringeCards } ...
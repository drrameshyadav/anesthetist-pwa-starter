import React from 'react'
import { Sex } from '../lib/patient'

export type GiveFn = (drug: 'atracurium' | 'vecuronium', maintenanceMin: number)=>void

export default function SyringeCards({ tbwKg, heightCm, sex }: { tbwKg: number, heightCm?: number, sex: Sex, }){
  return (
    <section className="w-full px-3 pb-24">
      {/* FENTANYL */}
      <article className="border rounded-2xl p-3 mb-3 bg-white shadow-sm">
        <h3 className="font-semibold">Fentanyl — <span className="opacity-70">2 mL + NS → 10 mL</span></h3>
        <p className="text-sm mt-1">Stock 50 <strong>mcg</strong>/mL. Syringe: 10 mL contains 250 <abbr title="micrograms">mcg</abbr>.</p>
        {/* example dose chip row */}
        <div className="mt-2 flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-gray-100">1 mcg/kg</span>
          <span className="px-2 py-1 rounded-full bg-gray-100">2 mcg/kg</span>
          <span className="px-2 py-1 rounded-full bg-gray-100">3 mcg/kg</span>
        </div>
      </article>

      {/* VECURONIUM */}
      <VecuroniumCard tbwKg={tbwKg} />

      {/* ATRACURIUM */}
      <AtracuriumCard tbwKg={tbwKg} />
    </section>
  )
}

function VecuroniumCard({ tbwKg }: { tbwKg: number }){
  const stdRange = '0.08–0.1 mg/kg IV bolus' // display only (no chips)
  return (
    <article className="border rounded-2xl p-3 mb-3 bg-white shadow-sm">
      <h3 className="font-semibold">Vecuronium — <span className="opacity-70">10 mg + NS → 10 mL</span></h3>
      <p className="text-sm mt-1">Standard dose: {stdRange}. Maintenance commonly smaller fractional doses. Adjust per patient & monitoring.</p>
      <div className="mt-2 flex gap-2">
        <button className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white"
          onClick={()=> (window as any).__startRelaxant?.('vecuronium', 30)}>
          Give & start timer
        </button>
        <button className="px-3 py-1.5 text-sm rounded border"
          onClick={()=> (window as any).__startRelaxant?.('vecuronium', 30)}>
          Top up now & Restart
        </button>
      </div>
    </article>
  )
}

function AtracuriumCard({ tbwKg }: { tbwKg: number }){
  const stdRange = '0.4–0.5 mg/kg IV bolus'
  return (
    <article className="border rounded-2xl p-3 mb-3 bg-white shadow-sm">
      <h3 className="font-semibold">Atracurium — <span className="opacity-70">25 mg + NS → 10 mL</span></h3>
      <p className="text-sm mt-1">Standard dose: {stdRange}. Maintenance commonly smaller fractional doses. Adjust per patient & monitoring.</p>
      <div className="mt-2 flex gap-2">
        <button className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white"
          onClick={()=> (window as any).__startRelaxant?.('atracurium', 20)}>
          Give & start timer
        </button>
        <button className="px-3 py-1.5 text-sm rounded border"
          onClick={()=> (window as any).__startRelaxant?.('atracurium', 20)}>
          Top up now & Restart
        </button>
      </div>
    </article>
  )
}

import React, { useState } from 'react'
import TabsBar, { TabKey } from './components/TabsBar'
import Timer from './components/Timer'
import SyringeCards from './components/SyringeCards'
import LegacySection from './components/LegacySection'
import { Sex, ibwKg, lbwKg } from './lib/patient'

function FooterNote(){
  return (<footer className="footer-note">For trained anesthesia professionals. Verify doses with monitoring & references.</footer>)
}

export default function App(){
  const [tab, setTab] = useState<TabKey>('syringes')
  const [tbw, setTbw] = useState<number>(70)
  const [height, setHeight] = useState<number|undefined>(170)
  const [sex, setSex] = useState<Sex>('M')
  const ibw = ibwKg(height, sex, tbw)
  const lbw = lbwKg(height, sex, tbw)

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-28">
      <header className="sticky top-0 bg-white border-b px-3 py-2 z-10">
        <h1 className="text-lg font-semibold">Anesthetist Toolkit</h1>
        <p className="text-xs text-gray-500">For trained anesthesia professionals. Verify all doses with references & monitoring.</p>
      </header>

      {tab === 'home' && (
        <section className="px-3 mt-3 space-y-4">
          <div>
            <h2 className="font-semibold">Patient</h2>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <label className="text-sm">TBW (kg)
                <input className="mt-1 w-full border rounded px-2 py-1" type="number" value={tbw} onChange={e=>setTbw(+e.target.value||0)} />
              </label>
              <label className="text-sm">Height (cm)
                <input className="mt-1 w-full border rounded px-2 py-1" type="number" value={height ?? ''} onChange={e=>setHeight(e.target.value? +e.target.value : undefined)} />
              </label>
              <label className="text-sm">Sex
                <select className="mt-1 w-full border rounded px-2 py-1" value={sex} onChange={e=>setSex(e.target.value as Sex)}>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </label>
            </div>
            <div className="mt-3 text-sm text-gray-600">IBW ≈ <strong>{ibw} kg</strong> · LBW ≈ <strong>{lbw} kg</strong></div>
          </div>

          <div>
            <h2 className="font-semibold">Sections</h2>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="card-link" onClick={()=>setTab('doses')}>Drug doses</button>
              <button className="card-link" onClick={()=>setTab('ett')}>ETT</button>
              <button className="card-link" onClick={()=>setTab('la')}>Local anesthetics</button>
              <button className="card-link" onClick={()=>setTab('fluids')}>Fluids / EBV</button>
              <button className="card-link" onClick={()=>setTab('mac')}>Volatile MAC</button>
            </div>
          </div>
        </section>
      )}

      {tab === 'syringes' && <SyringeCards tbwKg={tbw} heightCm={height} sex={sex} />}
      {tab === 'timer' && <Timer />}

      {tab === 'doses' && <LegacySection />}
      {tab === 'ett' && <LegacySection />}
      {tab === 'la' && <LegacySection />}
      {tab === 'fluids' && <LegacySection />}
      {tab === 'mac' && <LegacySection />}

      <TabsBar current={tab} setCurrent={setTab} />
      <FooterNote />
    </main>
  )
}

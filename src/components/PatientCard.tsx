import React from 'react'

function useLS(key: string, initial = '') {
  const [v, setV] = React.useState<string>(() => localStorage.getItem(key) ?? initial)
  React.useEffect(() => { localStorage.setItem(key, v) }, [key, v])
  return [v, setV] as const
}

export default function PatientCard() {
  const [w, setW] = useLS('patient.weight.kg', '')
  const [h, setH] = useLS('patient.height.cm', '')
  const [sex, setSex] = useLS('patient.sex', '')

  return (
    <section className="rounded-2xl border bg-white p-3 shadow-sm">
      <h2 className="text-base font-semibold mb-2">Patient</h2>
      <div className="grid grid-cols-3 gap-2">
        <label className="text-sm">
          <span className="block text-gray-600">Weight (kg)</span>
          <input className="w-full rounded border px-2 py-1" inputMode="decimal" value={w} onChange={e=>setW(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="block text-gray-600">Height (cm)</span>
          <input className="w-full rounded border px-2 py-1" inputMode="decimal" value={h} onChange={e=>setH(e.target.value)} />
        </label>
        <label className="text-sm">
          <span className="block text-gray-600">Sex</span>
          <select className="w-full rounded border px-2 py-1" value={sex} onChange={e=>setSex(e.target.value)}>
            <option value="">—</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </label>
      </div>
    </section>
  )
}

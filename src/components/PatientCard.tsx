import React, { useEffect, useState } from 'react'
import { derivePatient, PatientState, round } from '@/lib/patient'
import { storage } from '@/lib/storage'

const KEY = 'atk_patient_v136'

const DEFAULTS: PatientState = {
  age: '',
  weight: '',
  heightCm: '',
  heightIn: '',
  heightFt: '',
  heightIn2: '',
  heightUnit: 'cm',
  sex: 'male',
  weightBasis: 'AUTO'
}

export default function PatientCard() {
  const [state, setState] = useState<PatientState>(() => storage.get(KEY, DEFAULTS))
  useEffect(() => { storage.set(KEY, state) }, [state])

  const d = derivePatient(state)
  const set = <K extends keyof PatientState>(k: K) => (v: any) => setState(s => ({ ...s, [k]: v }))

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Patient</h2>
      </div>
      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Age (years)</span>
            <input className="px-3 py-2 border rounded-xl" inputMode="decimal"
                   value={state.age} onChange={e => set('age')(e.target.value)} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Weight (kg)</span>
            <input className="px-3 py-2 border rounded-xl" inputMode="decimal"
                   value={state.weight} onChange={e => set('weight')(e.target.value)} />
          </label>

          {state.heightUnit === 'cm' && (
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Height (cm)</span>
              <input className="px-3 py-2 border rounded-xl" inputMode="decimal"
                     value={state.heightCm} onChange={e => set('heightCm')(e.target.value)} />
            </label>
          )}
          {state.heightUnit === 'in' && (
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Height (inches)</span>
              <input className="px-3 py-2 border rounded-xl" inputMode="decimal"
                     value={state.heightIn} onChange={e => set('heightIn')(e.target.value)} />
            </label>
          )}
          {state.heightUnit === 'ftin' && (
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Height (ft)</span>
                <input className="px-3 py-2 border rounded-xl" inputMode="decimal"
                       value={state.heightFt} onChange={e => set('heightFt')(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Height (in)</span>
                <input className="px-3 py-2 border rounded-xl" inputMode="decimal"
                       value={state.heightIn2} onChange={e => set('heightIn2')(e.target.value)} />
              </label>
            </div>
          )}

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Height unit</span>
            <select className="px-3 py-2 border rounded-xl" value={state.heightUnit}
                    onChange={e => set('heightUnit')(e.target.value)}>
              <option value="cm">cm</option>
              <option value="in">in</option>
              <option value="ftin">ft+in</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Sex</span>
            <select className="px-3 py-2 border rounded-xl" value={state.sex}
                    onChange={e => set('sex')(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Weight for dosing</span>
            <select className="px-3 py-2 border rounded-xl" value={state.weightBasis}
                    onChange={e => set('weightBasis')(e.target.value)}>
              <option value="AUTO">Recommended (per drug)</option>
              <option value="TBW">TBW</option>
              <option value="IBW">IBW</option>
              <option value="LBW">LBW</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-3">
          <div className="pill"><div className="text-xs text-gray-600">TBW</div><div>{round(d.weightKg,2)} kg</div></div>
          <div className="pill"><div className="text-xs text-gray-600">IBW (Devine)</div><div>{d.age<12?'—':`${round(d.ibw,2)} kg`}</div></div>
          <div className="pill"><div className="text-xs text-gray-600">LBW (Janma)</div><div>{d.age<12?'—':`${round(d.lbw,2)} kg`}</div></div>
          <div className="pill"><div className="text-xs text-gray-600">BMI</div><div>{round(d.bmi,1)}</div></div>
          <div className="pill"><div className="text-xs text-gray-600">BSA (Mosteller)</div><div>{d.bsa?`${round(d.bsa,2)} m²`:'—'}</div></div>
          <div className="pill"><div className="text-xs text-gray-600">Age</div><div>{state.age || '-'}</div></div>
        </div>
      </div>
    </div>
  )
}

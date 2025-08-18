import React from 'react'
import { storage } from '../lib/storage'
import { derivePatient, type PatientState, round } from '../lib/patient'
import { fluidRate421, ebvMl, ettSizeByAge, ettDepthByID, lmaSizeByWeight } from '../lib/quick'

const PATIENT_KEY = 'atk_patient_v136'

export default function QuickInfo() {
  const patientState = storage.get<PatientState>(PATIENT_KEY, {
    age: '', weight: '', heightCm: '', heightIn: '', heightFt: '', heightIn2: '',
    heightUnit: 'cm', sex: 'male', weightBasis: 'AUTO'
  } as any)
  const p = derivePatient(patientState)
  const age = Number(patientState.age || 0)
  const wt = p.weightKg
  const sex = patientState.sex

  // ETT/LMA suggestions (age-based ETT formula; verify with your practice)
  const { cuffed, uncuffed } = ettSizeByAge(age)
  const depth = ettDepthByID(cuffed)

  // Fluids & EBV
  const miv = fluidRate421(wt)
  const ebv = ebvMl(wt, age, sex)

  // LMA (weight-based bins)
  const lma = lmaSizeByWeight(wt)

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Quick Info</h2>
        <p className="text-xs text-gray-500">Calculated from Patient card values. Use clinical judgement & local policy.</p>
      </div>

      <div className="p-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border p-3">
          <div className="text-sm text-gray-600">Maintenance fluids (4–2–1)</div>
          <div className="text-lg font-semibold">{miv} mL/hr</div>
          <div className="text-xs text-gray-500 mt-1">Weight: {round(wt,1)} kg</div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-sm text-gray-600">Estimated blood volume</div>
          <div className="text-lg font-semibold">{ebv} mL</div>
          <div className="text-xs text-gray-500 mt-1">Age: {age || '-'} y • Sex: {sex}</div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-sm text-gray-600">ETT (age formula)</div>
          <div className="text-lg font-semibold">Cuffed ~ {cuffed} mm (depth ~ {depth} cm)</div>
          <div className="text-xs text-gray-500">Uncuffed ~ {uncuffed} mm • Depth ≈ 3×ID</div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-sm text-gray-600">LMA size (by weight)</div>
          <div className="text-lg font-semibold"># {lma}</div>
          <div className="text-xs text-gray-500">Check manufacturer guidance & local policy</div>
        </div>
      </div>

      <div className="px-4 pb-4 text-xs text-gray-500">
        Values are typical rules of thumb; verify with monitors (e.g., TOF) and institutional standards.
      </div>
    </div>
  )
}

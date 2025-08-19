export type Unit = 'mg' | 'mcg'

export interface DrugDef {
  key: string
  label: string
  unitPerKg: Unit
  rangePerKg?: [number, number]
  adultFixedNote?: string
  concDefaultMgPerMl: number
  role: string
  notes?: string
}

export const DRUGS: DrugDef[] = [
  { key: 'propofol', label: 'Propofol', unitPerKg: 'mg', rangePerKg: [1.5, 2.5], concDefaultMgPerMl: 10, role: 'Induction', notes: 'Titrate to effect; lower dose in elderly/frail.' },
  { key: 'fentanyl', label: 'Fentanyl', unitPerKg: 'mcg', rangePerKg: [0.5, 2], concDefaultMgPerMl: 0.05, role: 'Analgesia bolus', notes: 'Titrate carefully; consider age/comorbidity.' },
  { key: 'ketamine', label: 'Ketamine', unitPerKg: 'mg', rangePerKg: [1, 2], concDefaultMgPerMl: 50, role: 'Induction/Adjunct', notes: 'Hemodynamically supportive; watch psychomimetics.' },
  { key: 'midazolam', label: 'Midazolam', unitPerKg: 'mg', rangePerKg: [0.02, 0.04], concDefaultMgPerMl: 1, role: 'Preop anxiolysis', notes: 'Titrate slowly; reduce with opioids/elderly.' },
  { key: 'dexamethasone', label: 'Dexamethasone', unitPerKg: 'mg', rangePerKg: [0.1, 0.1], concDefaultMgPerMl: 4, role: 'PONV prophylaxis', adultFixedNote: 'Adult typical 4–8 mg IV' },
  { key: 'ondansetron', label: 'Ondansetron', unitPerKg: 'mg', rangePerKg: [0.1, 0.1], concDefaultMgPerMl: 2, role: 'PONV prophylaxis', adultFixedNote: 'Adult typical 4 mg IV (max per policy/label)' },
]

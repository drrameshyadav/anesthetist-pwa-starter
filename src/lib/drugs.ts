export type Unit = 'mg' | 'mcg'

export interface DrugDef {
  key: string
  label: string
  unitPerKg: Unit                 // dosing unit per kg (mg or mcg)
  rangePerKg?: [number, number]   // e.g. [1.5, 2.5] mg/kg; if single value, repeat it
  adultFixedNote?: string         // e.g. "Adult typical 4–8 mg IV"
  concDefaultMgPerMl: number      // default vial concentration in mg/mL
  role: string                    // "Induction", "Analgesia bolus", etc.
  notes?: string
}

export const DRUGS: DrugDef[] = [
  {
    key: 'propofol',
    label: 'Propofol',
    unitPerKg: 'mg',
    rangePerKg: [1.5, 2.5],       // induction
    concDefaultMgPerMl: 10,       // 10 mg/mL
    role: 'Induction',
    notes: 'Titrate to effect; lower dose in elderly/frail.'
  },
  {
    key: 'fentanyl',
    label: 'Fentanyl',
    unitPerKg: 'mcg',
    rangePerKg: [0.5, 2],         // IV periop bolus range
    concDefaultMgPerMl: 0.05,     // 50 mcg/mL = 0.05 mg/mL
    role: 'Analgesia bolus',
    notes: 'Titrate carefully; consider age/comorbidity.'
  },
  {
    key: 'ketamine',
    label: 'Ketamine',
    unitPerKg: 'mg',
    rangePerKg: [1, 2],           // IV induction common
    concDefaultMgPerMl: 50,       // 50 mg/mL
    role: 'Induction/Adjunct',
    notes: 'Hemodynamically supportive; watch psychomimetics.'
  },
  {
    key: 'midazolam',
    label: 'Midazolam',
    unitPerKg: 'mg',
    rangePerKg: [0.02, 0.04],     // IV preop anxiolysis
    concDefaultMgPerMl: 1,        // 1 mg/mL (editable)
    role: 'Preop anxiolysis',
    notes: 'Titrate slowly; reduce with opioids/elderly.'
  },
  {
    key: 'dexamethasone',
    label: 'Dexamethasone',
    unitPerKg: 'mg',
    rangePerKg: [0.1, 0.1],       // show 0.1 mg/kg calc
    concDefaultMgPerMl: 4,        // 4 mg/mL
    role: 'PONV prophylaxis',
    adultFixedNote: 'Adult typical 4–8 mg IV'
  },
  {
    key: 'ondansetron',
    label: 'Ondansetron',
    unitPerKg: 'mg',
    rangePerKg: [0.1, 0.1],       // peds 0.1 mg/kg
    concDefaultMgPerMl: 2,        // 2 mg/mL (4 mg in 2 mL)
    role: 'PONV prophylaxis',
    adultFixedNote: 'Adult typical 4 mg IV (max per label/policy)'
  },
]
export type Sex = 'M' | 'F'

export function cmToM(cm: number) { return cm / 100 }
export function kg(n: number) { return n }

// Devine IBW (adults). If height missing, fall back to TBW.
export function ibwKg(heightCm?: number, sex: Sex = 'M', tbwKg?: number) {
  if (!heightCm) return tbwKg ?? 0
  const hIn = heightCm / 2.54
  const base = sex === 'M' ? 50 : 45.5
  const over5ft = Math.max(0, hIn - 60)
  return +(base + 2.3 * over5ft).toFixed(1)
}

// Janmahasatian LBW (adults). If inputs missing, fall back to TBW.
export function lbwKg(heightCm?: number, sex: Sex = 'M', tbwKg?: number) {
  if (!heightCm || !tbwKg) return tbwKg ?? 0
  const hM = cmToM(heightCm)
  const bmi = tbwKg / (hM * hM)
  const a = sex === 'M' ? 9270 : 9270
  const b = sex === 'M' ? 6680 : 8780
  const c = sex === 'M' ? 216 : 244
  // LBW = (a * TBW) / (b + c * BMI)
  return +((a * tbwKg) / (b + c * bmi)).toFixed(1)
}

/** Back-compat helpers for older components that still import these */
export type PatientState = { tbwKg: number; heightCm?: number; sex: Sex }

export function round(n: number, dp = 1) {
  return +n.toFixed(dp)
}

/** Derive IBW/LBW alongside inputs (used by QuickInfo.tsx and similar) */
export function derivePatient(p: PatientState) {
  const ibw = ibwKg(p.heightCm, p.sex, p.tbwKg)
  const lbw = lbwKg(p.heightCm, p.sex, p.tbwKg)
  return { ...p, ibwKg: ibw, lbwKg: lbw }
}

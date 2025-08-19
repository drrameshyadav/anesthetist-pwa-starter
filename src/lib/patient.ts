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

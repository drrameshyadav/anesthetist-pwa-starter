export type Sex = 'M' | 'F'

/** Devine IBW (kg): M = 50 + 2.3*(inches over 60), F = 45.5 + 2.3*(over 60) */
export function ibwKg(heightCm: number, sex: Sex): number {
  const inches = heightCm / 2.54
  const over60 = Math.max(0, inches - 60)
  return sex === 'M' ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60
}

/** Janmahasatian LBW: requires TBW + height */
export function lbwKg(tbwKg: number, heightCm: number, sex: Sex): number {
  const hM = heightCm / 100
  const bmi = tbwKg / (hM * hM)
  if (!isFinite(bmi) || bmi <= 0) return tbwKg
  if (sex === 'M') return (9270 * tbwKg) / (6680 + 216 * bmi)
  return (9270 * tbwKg) / (8780 + 244 * bmi)
}

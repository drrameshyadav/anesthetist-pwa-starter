export function fluidRate421(weightKg: number): number {
  // 4-2-1 rule (mL/hr)
  const w = Math.max(0, weightKg || 0)
  const first10 = Math.min(w, 10) * 4
  const second10 = Math.min(Math.max(w - 10, 0), 10) * 2
  const rest = Math.max(w - 20, 0) * 1
  return Math.round(first10 + second10 + rest)
}

export function ebvMl(weightKg: number, ageYears: number, sex: 'male' | 'female'): number {
  // Typical EBV (mL/kg): neonate 90, infant 80, child 75, adult M 70, adult F 65
  const w = Math.max(0, weightKg || 0)
  let perKg = 75
  if (ageYears < 0.083) perKg = 90        // <1 month
  else if (ageYears < 1) perKg = 80       // 1–12 months
  else if (ageYears < 12) perKg = 75      // 1–12 years
  else perKg = (sex === 'female') ? 65 : 70
  return Math.round(perKg * w)
}

export function ettSizeByAge(ageYears: number) {
  // Cuffed ~ (age/4 + 3.5), Uncuffed ~ (age/4 + 4)
  const a = Math.max(0, ageYears || 0)
  const cuffed = +(a / 4 + 3.5).toFixed(1)
  const uncuffed = +(a / 4 + 4).toFixed(1)
  return { cuffed, uncuffed }
}

export function ettDepthByID(idMm: number) {
  // Depth (cm) ≈ 3 × ETT ID (rule of thumb)
  const cm = Math.round((idMm || 0) * 3 * 10) / 10
  return cm
}

export function lmaSizeByWeight(weightKg: number) {
  const w = Math.max(0, weightKg || 0)
  if (w < 5) return 1
  if (w < 10) return 1.5
  if (w < 20) return 2
  if (w < 30) return 2.5
  if (w < 50) return 3
  if (w < 70) return 4
  if (w <= 100) return 5
  return 5
}

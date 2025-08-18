export type Sex = 'male' | 'female'
export type HeightUnit = 'cm' | 'in' | 'ftin'

export function round(n: number | null | undefined, d = 2): string {
  if (n == null || !isFinite(n)) return '-'
  const p = Math.pow(10, d)
  return String(Math.round(n * p) / p)
}
export function toNum(v: any): number {
  const n = parseFloat(String(v ?? '').replace(/,/g, ''))
  return isFinite(n) ? n : 0
}
export function inToCm(inches: number): number { return inches * 2.54 }

export function devineIBW(sex: Sex, hCm: number): number {
  if (!hCm) return 0
  const base = sex === 'female' ? 45.5 : 50
  const extra = Math.max(0, hCm - 152.4) * 0.9
  return base + extra
}

export function janmaLBW(sex: Sex, wKg: number, hCm: number): number {
  if (!hCm || !wKg) return 0
  const m = hCm / 100
  const bmi = wKg / (m * m)
  return (sex === 'female')
    ? (9270 * wKg) / (8780 + 244 * bmi)
    : (9270 * wKg) / (6680 + 216 * bmi)
}

export function mostellerBSA(hCm: number, wKg: number): number {
  if (!hCm || !wKg) return 0
  return Math.sqrt((hCm * wKg) / 3600)
}

export type PatientState = {
  age: string
  weight: string
  heightUnit: HeightUnit
  heightCm: string
  heightIn: string
  heightFt: string
  heightIn2: string
  sex: Sex
  weightBasis: 'AUTO' | 'TBW' | 'IBW' | 'LBW'
}

export function derivePatient(s: PatientState) {
  const w = toNum(s.weight)
  let h = 0
  if (s.heightUnit === 'cm') h = toNum(s.heightCm)
  else if (s.heightUnit === 'in') h = inToCm(toNum(s.heightIn))
  else h = inToCm(toNum(s.heightFt) * 12 + toNum(s.heightIn2))

  const m = h ? h / 100 : 0
  const bmi = m > 0 && w > 0 ? w / (m * m) : 0
  const age = toNum(s.age)

  const ibw = h > 0 && age >= 12 ? devineIBW(s.sex, h) : 0
  const lbw = h > 0 && age >= 12 ? janmaLBW(s.sex, w, h) : 0
  const bsa = h > 0 && w > 0 ? mostellerBSA(h, w) : 0

  return { weightKg: w || 0, heightCm: h || 0, bmi, ibw, lbw, bsa, age }
}

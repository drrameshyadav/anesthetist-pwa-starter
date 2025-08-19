export type Unit = 'mg' | 'mcg'
export type Group = 'adult' | 'peds'
export type SyringeMode = 'target' | 'fixed'

/** Stock concentrations (mg/mL). All fixed except vecuronium (editable). */
export interface StockConc { label: string; mgPerMl: number; editable?: boolean }
export const STOCKS: Record<string, StockConc> = {
  fentanyl:        { label: 'Fentanyl',        mgPerMl: 0.05 },   // 50 µg/mL
  ketamine:        { label: 'Ketamine',        mgPerMl: 50 },
  atracurium:      { label: 'Atracurium',      mgPerMl: 10 },
  propofol:        { label: 'Propofol',        mgPerMl: 10 },
  vecuronium:      { label: 'Vecuronium',      mgPerMl: 1, editable: true }, // reconstitution varies
  neostigmine:     { label: 'Neostigmine',     mgPerMl: 0.5 },
  glycopyrrolate:  { label: 'Glycopyrrolate',  mgPerMl: 0.2 },
  midazolam:       { label: 'Midazolam',       mgPerMl: 1 },
  succinylcholine: { label: 'Succinylcholine', mgPerMl: 50 },
  atropine:        { label: 'Atropine',        mgPerMl: 0.6 },
  dexamethasone:   { label: 'Dexamethasone',   mgPerMl: 4 },
}

export interface SyringeDef {
  key: string
  group: Group
  label: string                 // card title
  finalVolumeMl: number         // usually 10 mL
  mode: SyringeMode
  target?: { drugKey: string; amount: number; unit: Unit }
  fixed?: Array<{ drugKey: string; volumeMl: number }>
  note?: string
  doseConfig?: {
    unitPerKg: Unit
    defaultPerKg: number
    rangePerKg?: [number, number]
    basis: 'TBW' | 'IBW' | 'LBW' | 'AUTO'
    primaryDrugKey?: string
  }
}

function unitToMg(n: number, u: Unit) { return u === 'mcg' ? n / 1000 : n }

/** Build adult titles like “X mL + NS→10 mL” for single-drug targets */
function volTitle(drugKey: string, targetMg: number, finalMl = 10): string {
  const stock = STOCKS[drugKey].mgPerMl
  const draw = targetMg / stock
  if (Math.abs(draw - finalMl) < 1e-6) return `${STOCKS[drugKey].label} — ${finalMl} mL (undiluted)`
  const drawStr = draw.toFixed(2).replace(/\.00$/, '')
  return `${STOCKS[drugKey].label} — ${drawStr} mL + NS→${finalMl} mL`
}

/** Your practice, encoded (adult titles clarified; vecuronium subtitle shown in UI) */
export const SYRINGES: SyringeDef[] = [
  // Adult
  { key: 'adult_fentanyl', group: 'adult', label: volTitle('fentanyl', 0.1), finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'fentanyl', amount: 100, unit: 'mcg' },
    doseConfig: { unitPerKg: 'mcg', defaultPerKg: 1.0, rangePerKg: [0.5, 2], basis: 'AUTO' } },

  { key: 'adult_ketamine', group: 'adult', label: volTitle('ketamine', 100), finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'ketamine', amount: 100, unit: 'mg' },
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.5, rangePerKg: [0.25, 1], basis: 'AUTO' } },

  { key: 'adult_propofol', group: 'adult', label: volTitle('propofol', 100), finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'propofol', amount: 100, unit: 'mg' },
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 2, rangePerKg: [1.5, 2.5], basis: 'AUTO' } },

  { key: 'adult_atracurium', group: 'adult', label: volTitle('atracurium', 25), finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'atracurium', amount: 25, unit: 'mg' },
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.5, rangePerKg: [0.5, 0.5], basis: 'AUTO' } },

  // Vecuronium title simplified; subtitle is rendered in the component
  { key: 'adult_vecuronium', group: 'adult', label: 'Vecuronium', finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'vecuronium', amount: 10, unit: 'mg' },
    note: 'Edit the stock conc if your local reconstitution differs.',
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.08, rangePerKg: [0.08, 0.1], basis: 'AUTO' } },

  { key: 'adult_reversal', group: 'adult', label: 'Reversal — 5 mL Neostigmine + 2 mL Glyco + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'neostigmine', volumeMl: 5 }, { drugKey: 'glycopyrrolate', volumeMl: 2 }],
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.05, rangePerKg: [0.04, 0.07], basis: 'AUTO', primaryDrugKey: 'neostigmine' } },

  // Pediatric (fixed draws)
  { key: 'peds_midazolam', group: 'peds', label: 'Midazolam 1 mL + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'midazolam', volumeMl: 1 }], doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.02, rangePerKg: [0.02, 0.04], basis: 'AUTO' } },
  { key: 'peds_glyco', group: 'peds', label: 'Glycopyrrolate 1 mL + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'glycopyrrolate', volumeMl: 1 }], doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.01, rangePerKg: [0.005, 0.01], basis: 'AUTO' } },
  { key: 'peds_sux', group: 'peds', label: 'Succinylcholine 1 mL + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'succinylcholine', volumeMl: 1 }], doseConfig: { unitPerKg: 'mg', defaultPerKg: 1, rangePerKg: [1, 1], basis: 'AUTO' } },
  { key: 'peds_propofol', group: 'peds', label: 'Propofol 5 mL + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'propofol', volumeMl: 5 }], doseConfig: { unitPerKg: 'mg', defaultPerKg: 2, rangePerKg: [1.5, 2.5], basis: 'AUTO' } },
  { key: 'peds_ketamine', group: 'peds', label: 'Ketamine 1 mL + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'ketamine', volumeMl: 1 }], doseConfig: { unitPerKg: 'mg', defaultPerKg: 1, rangePerKg: [1, 2], basis: 'AUTO' } },
  { key: 'peds_atracurium', group: 'peds', label: 'Atracurium 2.5 mL + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'atracurium', volumeMl: 2.5 }], doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.5, rangePerKg: [0.5, 0.5], basis: 'AUTO' } },
  { key: 'peds_atropine', group: 'peds', label: 'Atropine 1 mL + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'atropine', volumeMl: 1 }], doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.02, rangePerKg: [0.01, 0.02], basis: 'AUTO' } },
  { key: 'peds_dexa', group: 'peds', label: 'Dexamethasone 2 mL + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'dexamethasone', volumeMl: 2 }], doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.1, rangePerKg: [0.1, 0.1], basis: 'TBW' } },
  { key: 'peds_reversal', group: 'peds', label: 'Reversal — 2 mL Neo + 1 mL Glyco + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'neostigmine', volumeMl: 2 }, { drugKey: 'glycopyrrolate', volumeMl: 1 }],
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.05, rangePerKg: [0.04, 0.07], basis: 'AUTO', primaryDrugKey: 'neostigmine' } },
]

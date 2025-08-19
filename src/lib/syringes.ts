export type Unit = 'mg' | 'mcg'
export type Group = 'adult' | 'peds'
export type SyringeMode = 'target' | 'fixed'  // target = “X mg in 10 mL”; fixed = fixed volumes from stock then NS→10 mL

/** Stock concentrations (mg/mL). All locked except vecuronium (varies by reconstitution). */
export interface StockConc { label: string; mgPerMl: number; editable?: boolean; note?: string }

export const STOCKS: Record<string, StockConc> = {
  fentanyl:       { label: 'Fentanyl',       mgPerMl: 0.05 },          // 50 mcg/mL
  ketamine:       { label: 'Ketamine',       mgPerMl: 50 },            // 50 mg/mL
  atracurium:     { label: 'Atracurium',     mgPerMl: 10 },            // 10 mg/mL
  propofol:       { label: 'Propofol',       mgPerMl: 10 },            // 10 mg/mL
  vecuronium:     { label: 'Vecuronium',     mgPerMl: 1, editable: true, note: 'Edit if your local reconstitution differs.' }, // commonly 1 mg/mL
  neostigmine:    { label: 'Neostigmine',    mgPerMl: 0.5 },           // 0.5 mg/mL
  glycopyrrolate: { label: 'Glycopyrrolate', mgPerMl: 0.2 },           // 0.2 mg/mL
  midazolam:      { label: 'Midazolam',      mgPerMl: 1 },             // 1 mg/mL
  succinylcholine:{ label: 'Succinylcholine',mgPerMl: 50 },            // 50 mg/mL
  atropine:       { label: 'Atropine',       mgPerMl: 0.6 },           // 0.6 mg/mL
  dexamethasone:  { label: 'Dexamethasone',  mgPerMl: 4 },             // 4 mg/mL
}

export interface SyringeDef {
  key: string
  group: Group
  label: string           // visible title on card (e.g., “Fentanyl — 2 mL + NS→10 mL”)
  finalVolumeMl: number   // usually 10
  mode: SyringeMode
  target?: { drugKey: string; amount: number; unit: Unit } // for target syringes
  fixed?: Array<{ drugKey: string; volumeMl: number }>     // for fixed draw syringes
  note?: string
  doseConfig?: DoseConfig // per-drug dose→mL calculator
}

export type WeightBasis = 'TBW' | 'IBW' | 'LBW' | 'AUTO'
export interface DoseConfig {
  /** dose units per kg: 'mg' or 'mcg' */
  unitPerKg: Unit
  /** default dose per kg (middle of range); UI editable */
  defaultPerKg: number
  /** optional safe range hint for UI */
  rangePerKg?: [number, number]
  /** weight basis to use; AUTO will map: LBW for opioids/induction; IBW for non-depolarizing NMBAs; TBW for SCh/reversal/anticholinergics */
  basis: WeightBasis
  /** when syringe mixes drugs (e.g., reversal), which component drives the dose */
  primaryDrugKey?: string
}

/** Helper to make adult titles in “X mL + NS→10 mL” style given a target in 10 mL */
function volTitle(drugKey: string, targetMg: number, finalMl = 10): string {
  const stock = STOCKS[drugKey].mgPerMl
  const draw = targetMg / stock
  if (Math.abs(draw - finalMl) < 1e-6) return `${STOCKS[drugKey].label} — ${finalMl} mL (undiluted)`
  const ns = Math.max(0, finalMl - draw).toFixed(1).replace(/\.0$/, '')
  const drawStr = draw.toFixed(2).replace(/\.00$/, '')
  return `${STOCKS[drugKey].label} — ${drawStr} mL + NS→${finalMl} mL`
}

/** Your practice, encoded */
export const SYRINGES: SyringeDef[] = [
  // --- ADULT (titles in “X mL + NS→10 mL”) ---
  // Fentanyl 100 mcg in 10 mL  -> stock 0.05 mg/mL => draw 2 mL, NS→10
  { key: 'adult_fentanyl', group: 'adult', label: volTitle('fentanyl', 0.1), finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'fentanyl', amount: 100, unit: 'mcg' },
    doseConfig: { unitPerKg: 'mcg', defaultPerKg: 1.0, rangePerKg: [0.5, 2], basis: 'AUTO' } },

  // Ketamine 100 mg in 10 mL (10 mg/mL) is common; confirm locally.
  { key: 'adult_ketamine', group: 'adult', label: volTitle('ketamine', 100), finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'ketamine', amount: 100, unit: 'mg' },
    note: 'Default = 100 mg in 10 mL (10 mg/mL). Adjust dose per kg in card if needed.',
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.5, rangePerKg: [0.25, 1], basis: 'AUTO' } },

  // Propofol 100 mg / 10 mL (undiluted: 10 mg/mL, draw 10 mL)
  { key: 'adult_propofol', group: 'adult', label: volTitle('propofol', 100), finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'propofol', amount: 100, unit: 'mg' },
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 2, rangePerKg: [1.5, 2.5], basis: 'AUTO' } },

  // Atracurium 25 mg / 10 mL -> draw 2.5 mL + NS→10
  { key: 'adult_atracurium', group: 'adult', label: volTitle('atracurium', 25), finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'atracurium', amount: 25, unit: 'mg' },
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.5, rangePerKg: [0.5, 0.5], basis: 'AUTO' } },

  // Vecuronium 10 mg / 10 mL -> draw depends on reconstitution (editable)
  { key: 'adult_vecuronium', group: 'adult', label: 'Vecuronium — draw X mL (editable conc) + NS→10 mL', finalVolumeMl: 10, mode: 'target',
    target: { drugKey: 'vecuronium', amount: 10, unit: 'mg' },
    note: 'Local reconstitution varies; edit the stock conc in the card.',
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.08, rangePerKg: [0.08, 0.1], basis: 'AUTO' } },

  // Adult reversal: 5 mL neostigmine + 2 mL glyco + NS→10 mL (dose guided by neostigmine)
  { key: 'adult_reversal', group: 'adult', label: 'Reversal — 5 mL Neostigmine + 2 mL Glyco + NS→10 mL', finalVolumeMl: 10, mode: 'fixed',
    fixed: [{ drugKey: 'neostigmine', volumeMl: 5 }, { drugKey: 'glycopyrrolate', volumeMl: 2 }],
    doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.05, rangePerKg: [0.04, 0.07], basis: 'AUTO', primaryDrugKey: 'neostigmine' } },

  // --- PEDIATRIC (your list) ---
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

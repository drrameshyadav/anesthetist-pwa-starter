export type Unit = 'mg' | 'mcg'

/** Concentration we draw from (editable in UI), in mg/mL */
export interface StockConc {
  label: string
  defaultMgPerMl?: number // leave undefined if you prefer to force confirm in UI
  note?: string
}

export const STOCKS: Record<string, StockConc> = {
  fentanyl:      { label: 'Fentanyl',      defaultMgPerMl: 0.05, note: 'Common 50 mcg/mL → 0.05 mg/mL. Confirm locally.' },
  ketamine:      { label: 'Ketamine',      defaultMgPerMl: 50,    note: 'Common 50 mg/mL (or 10 mg/mL). Confirm locally.' },
  propofol:      { label: 'Propofol',      defaultMgPerMl: 10,    note: 'Common 10 mg/mL.' },
  atracurium:    { label: 'Atracurium',    defaultMgPerMl: 10,    note: 'Common 10 mg/mL. Confirm locally.' },
  vecuronium:    { label: 'Vecuronium',    defaultMgPerMl: 1,     note: 'Often ~1 mg/mL after reconstitution. Confirm volume/concentration locally.' },
  neostigmine:   { label: 'Neostigmine',   /*defaultMgPerMl: 2.5,*/ note: 'Concentration varies (0.5–2.5 mg/mL). ENTER YOUR LOCAL VALUE.' },
  glycopyrrolate:{ label: 'Glycopyrrolate',/*defaultMgPerMl: 0.2,*/ note: 'Often 0.2 mg/mL. ENTER YOUR LOCAL VALUE.' },
  midazolam:     { label: 'Midazolam',     defaultMgPerMl: 1,     note: 'Common 1 mg/mL (also 5 mg/mL exists). Confirm locally.' },
  succinylcholine:{ label: 'Succinylcholine',/*defaultMgPerMl: 20,*/ note: 'Varies (10–20 mg/mL typical). ENTER YOUR LOCAL VALUE.' },
  atropine:      { label: 'Atropine',      /*defaultMgPerMl: 0.6,*/ note: 'Varies (0.1–1 mg/mL). ENTER YOUR LOCAL VALUE.' },
  dexamethasone: { label: 'Dexamethasone', defaultMgPerMl: 4,     note: 'Common 4 mg/mL. Confirm locally.' },
}

export type Group = 'adult' | 'peds'
export type SyringeMode = 'target' | 'fixed'  // target = total drug amount in 10 mL; fixed = fixed volumes from stocks

export interface SyringeDef {
  key: string
  group: Group
  label: string            // what’s on the syringe label
  finalVolumeMl: number    // usually 10 mL
  mode: SyringeMode
  /** target: one-drug syringe “X mg (or mcg) in 10 mL” — UI lets you edit amount/unit */
  target?: { drugKey: string; amount: number; unit: Unit }
  /** fixed: list of fixed volumes from various drugs (fill NS to finalVolume) */
  fixed?: Array<{ drugKey: string; volumeMl: number }>
  note?: string
}

/** Your recipes from the message (please confirm locally). */
export const SYRINGES: SyringeDef[] = [
  // --- ADULT ---
  { key: 'adult_fentanyl_100mcg', group: 'adult', label: 'Fentanyl 100 mcg / 10 mL', finalVolumeMl: 10,
    mode: 'target', target: { drugKey: 'fentanyl', amount: 100, unit: 'mcg' } },

  // NB: You wrote “Ketamine 100 mcg / 10 mL”. That’s unusually low (ketamine is usually dosed in mg).
  // We honour your number but please EDIT IN UI if you intend “100 mg”.
  { key: 'adult_ketamine_100mcg', group: 'adult', label: 'Ketamine 100 mcg / 10 mL (⚠ please confirm)', finalVolumeMl: 10,
    mode: 'target', target: { drugKey: 'ketamine', amount: 100, unit: 'mcg' },
    note: 'Typical practice uses mg, e.g., 100 mg in 10 mL (10 mg/mL). Please confirm your local prep.' },

  { key: 'adult_propofol_100mg', group: 'adult', label: 'Propofol 100 mg / 10 mL (undiluted)', finalVolumeMl: 10,
    mode: 'target', target: { drugKey: 'propofol', amount: 100, unit: 'mg' } },

  { key: 'adult_atracurium_25mg', group: 'adult', label: 'Atracurium 25 mg / 10 mL', finalVolumeMl: 10,
    mode: 'target', target: { drugKey: 'atracurium', amount: 25, unit: 'mg' } },

  { key: 'adult_vecuronium_10mg', group: 'adult', label: 'Vecuronium 10 mg / 10 mL', finalVolumeMl: 10,
    mode: 'target', target: { drugKey: 'vecuronium', amount: 10, unit: 'mg' } },

  // Adult reversal: 5 mL neostigmine + 2 mL glyco + NS to 10 mL
  { key: 'adult_reversal', group: 'adult', label: 'Reversal: 5 mL Neostigmine + 2 mL Glyco + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [
      { drugKey: 'neostigmine', volumeMl: 5 },
      { drugKey: 'glycopyrrolate', volumeMl: 2 },
    ],
    note: 'Enter your local stock concentrations to compute mg content.' },

  // --- PEDIATRIC ---
  // For peds you specified fixed volumes + fill NS to 10 mL:
  { key: 'peds_midazolam', group: 'peds', label: 'Midazolam 1 mL + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [{ drugKey: 'midazolam', volumeMl: 1 }] },

  { key: 'peds_glyco', group: 'peds', label: 'Glycopyrrolate 1 mL + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [{ drugKey: 'glycopyrrolate', volumeMl: 1 }] },

  { key: 'peds_sux', group: 'peds', label: 'Succinylcholine 1 mL + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [{ drugKey: 'succinylcholine', volumeMl: 1 }] },

  { key: 'peds_propofol', group: 'peds', label: 'Propofol 5 mL + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [{ drugKey: 'propofol', volumeMl: 5 }] },

  { key: 'peds_ketamine', group: 'peds', label: 'Ketamine 1 mL + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [{ drugKey: 'ketamine', volumeMl: 1 }] },

  { key: 'peds_atracurium', group: 'peds', label: 'Atracurium 2.5 mL + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [{ drugKey: 'atracurium', volumeMl: 2.5 }] },

  { key: 'peds_atropine', group: 'peds', label: 'Atropine 1 mL + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [{ drugKey: 'atropine', volumeMl: 1 }] },

  { key: 'peds_dexa', group: 'peds', label: 'Dexamethasone 2 mL + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [{ drugKey: 'dexamethasone', volumeMl: 2 }] },

  { key: 'peds_reversal', group: 'peds', label: 'Reversal: 2 mL Neostigmine + 1 mL Glyco + NS→10 mL', finalVolumeMl: 10,
    mode: 'fixed', fixed: [
      { drugKey: 'neostigmine', volumeMl: 2 },
      { drugKey: 'glycopyrrolate', volumeMl: 1 },
    ],
    note: 'Enter your local stock concentrations to compute mg content.' },
]

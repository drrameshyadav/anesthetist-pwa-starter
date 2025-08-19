export type RelaxantDrug = 'atracurium' | 'vecuronium'
export type RelaxantPhase = 'bolus' | 'maintenance'

export const RELAXANT_EVENT = 'relaxant-give'

/** Default maintenance windows (minutes). Tweak later if you wish. */
export const RELAXANT_DEFAULT_MINUTES: Record<RelaxantDrug, number> = {
  atracurium: 20,
  vecuronium: 30,
}

/** Fire a window event that the Timer listens to. */
export function triggerRelaxantGive(drug: RelaxantDrug) {
  const detail = { drug, at: Date.now() }
  window.dispatchEvent(new CustomEvent(RELAXANT_EVENT, { detail }))
}

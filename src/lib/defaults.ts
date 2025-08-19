export const DEFAULT_STOCK_MG_PER_ML: Record<string, number> = {
  // India-typical
  fentanyl: 0.05,        // 50 mcg/mL
  ketamine: 50,
  atracurium: 10,
  propofol: 10,
  neostigmine: 0.5,
  glyco: 0.2,            // glycopyrrolate
  midazolam: 1,
  sux: 50,               // succinylcholine
  scholine: 50,          // alt key
  atropine: 0.6,
  dexamethasone: 4,
  // vecuronium intentionally omitted (reconstituted → varies)
};

/**
 * Return a sensible default mg/mL for a stock drug.
 * 1) Try by key in DEFAULT_STOCK_MG_PER_ML
 * 2) Else infer by label text
 * 3) Else return '' to indicate "no default"
 */
export function defaultStockMgPerMl(key: string, label?: string): number | '' {
  if (key in DEFAULT_STOCK_MG_PER_ML) return DEFAULT_STOCK_MG_PER_ML[key];
  const L = (label ?? '').toLowerCase();
  if (L.includes('fentanyl')) return 0.05;
  if (L.includes('ketamine')) return 50;
  if (L.includes('atracurium')) return 10;
  if (L.includes('propofol')) return 10;
  if (L.includes('neostigmine')) return 0.5;
  if (L.includes('glyco')) return 0.2;
  if (L.includes('midazolam')) return 1;
  if (L.includes('succinyl') || L.includes('sux') || L.includes('scholine')) return 50;
  if (L.includes('atropine')) return 0.6;
  if (L.includes('dexamethasone')) return 4;
  // vecuronium or unknown → no default
  return '';
}

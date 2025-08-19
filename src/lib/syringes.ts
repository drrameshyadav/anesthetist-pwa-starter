@@
 // (existing exports … STOCKS, SYRINGES, types, etc. remain unchanged)

+// --- Default stock concentrations (mg/mL), India-typical ---
+// Leave vecuronium blank (reconstituted, varies by practice)
+export const DEFAULT_STOCK_MG_PER_ML: Record<string, number> = {
+  // try to cover the most likely stock keys used in STOCKS
+  fentanyl: 0.05,        // 50 mcg/mL
+  ketamine: 50,
+  atracurium: 10,
+  propofol: 10,
+  neostigmine: 0.5,
+  glyco: 0.2,            // glycopyrrolate
+  midazolam: 1,
+  sux: 50,               // succinylcholine
+  scholine: 50,          // alt key if used
+  atropine: 0.6,
+  dexamethasone: 4,
+};
+
+/**
+ * Returns a sensible default mg/mL for a stock drug.
+ * 1) If the key exists in DEFAULT_STOCK_MG_PER_ML → use it.
+ * 2) Else, try to infer from label text (fallback heuristics).
+ * 3) Else, return '' (no default).
+ */
+export function defaultStockMgPerMl(key: string, label?: string): number | '' {
+  if (key in DEFAULT_STOCK_MG_PER_ML) return DEFAULT_STOCK_MG_PER_ML[key];
+  const L = (label ?? '').toLowerCase();
+  if (L.includes('fentanyl')) return 0.05;   // 50 mcg/mL
+  if (L.includes('ketamine')) return 50;
+  if (L.includes('atracurium')) return 10;
+  if (L.includes('propofol')) return 10;
+  if (L.includes('neostigmine')) return 0.5;
+  if (L.includes('glyco')) return 0.2;
+  if (L.includes('midazolam')) return 1;
+  if (L.includes('succinyl') || L.includes('sux') || L.includes('scholine')) return 50;
+  if (L.includes('atropine')) return 0.6;
+  if (L.includes('dexamethasone')) return 4;
+  // vecuronium (or unknown) → no default
+  return '';
+}

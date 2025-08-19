@@
-import React from 'react'
-import { STOCKS, SYRINGES, type Unit, type SyringeDef, type Group } from '../lib/syringes'
+import React from 'react'
+import { STOCKS, SYRINGES, defaultStockMgPerMl, type Unit, type SyringeDef, type Group } from '../lib/syringes'
@@
-function useLocalNumber(key: string, initial?: number) {
+function useLocalNumber(key: string, initial?: number) {
   const [v, setV] = React.useState<number | ''>(() => {
     const raw = localStorage.getItem(key)
     if (raw == null) return initial ?? ''
     const n = Number(raw)
     return isNaN(n) ? '' : n
   })
   React.useEffect(() => {
     if (v === '' || v == null) localStorage.removeItem(key)
     else localStorage.setItem(key, String(v))
   }, [key, v])
   return [v, setV] as const
 }
@@
-function unitToMg(amount: number, unit: Unit) {
+function unitToMg(amount: number, unit: Unit) {
   return unit === 'mcg' ? amount / 1000 : amount
 }
@@
 export function SyringeCards() {
   const [tab, setTab] = React.useState<Group>('adult')
 
   // one localStorage-backed concentration per stock drug
   const [conc, setConc] = React.useState<Record<string, number | ''>>(() => {
     const initial: Record<string, number | ''> = {}
     for (const key of Object.keys(STOCKS)) {
       const ls = localStorage.getItem(`stock.${key}.mgml`)
-      if (ls != null && ls !== '' && !isNaN(Number(ls))) initial[key] = Number(ls)
-      else if (STOCKS[key].defaultMgPerMl != null) initial[key] = STOCKS[key].defaultMgPerMl!
-      else initial[key] = ''
+      if (ls != null && ls !== '' && !isNaN(Number(ls))) {
+        initial[key] = Number(ls)
+      } else {
+        const label = STOCKS[key]?.label ?? key
+        const def = defaultStockMgPerMl(key, label) // centralized defaults + safe fallback
+        initial[key] = def === '' ? '' : Number(def)
+      }
     }
     return initial
   })
@@
   return (
     <section className="px-3 pb-6">
       <div className="mb-3 flex gap-2">
         <button
           className={`rounded-lg px-3 py-2 text-sm border ${tab==='adult'?'bg-blue-600 text-white':'bg-white'}`}
           onClick={() => setTab('adult')}
         >Adult</button>
         <button
           className={`rounded-lg px-3 py-2 text-sm border ${tab==='peds'?'bg-blue-600 text-white':'bg-white'}`}
           onClick={() => setTab('peds')}
         >Pediatric</button>
       </div>
@@
 }

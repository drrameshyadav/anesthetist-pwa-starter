@@
-import React from 'react'
+import React from 'react'
 import { STOCKS, SYRINGES, type Group, type Unit, type WeightBasis } from '../lib/syringes'
 import { ibwKg, lbwKg, type Sex } from '../lib/weights'
 import { triggerRelaxantGive } from '../lib/relaxant'
@@
 export function SyringeCards() {
   const [tab, setTab] = React.useState<Group>('adult')
+  // keep per-card dose state OUTSIDE the map to avoid hooks-in-a-loop crash when switching tabs
+  const [doseMap, setDoseMap] = React.useState<Record<string,string>>({})
@@
-  const list = SYRINGES.filter(s => s.group === tab)
+  const list = SYRINGES.filter(s => s.group === tab)
 
   return (
-    <section className="px-1 md:px-2">
+    <section className="px-0 md:px-0">
@@
-      <div className="grid grid-cols-1 gap-2">
+      <div className="grid grid-cols-1 gap-2">
         {list.map(s => {
           const { mgPerMl: finalC, primaryDrugKey } = finalConcMgPerMl(s, vecuConc)
@@
-          const [doseStr, setDoseStr] = React.useState<string>(String(s.doseConfig?.defaultPerKg ?? ''))
+          const doseStr = doseMap[s.key] ?? String(s.doseConfig?.defaultPerKg ?? '')
           const range = s.doseConfig?.rangePerKg
           const low = range?.[0]
           const typical = s.doseConfig?.defaultPerKg
           const high = range?.[1]
@@
           return (
             <article key={s.key} className="rounded-2xl border bg-white p-3 shadow-sm">
               <div className="flex items-start justify-between gap-3">
                 <div>
                   <div className="text-base font-semibold">{s.label}</div>
                   <div className="text-xs text-gray-600">{s.group === 'adult' ? 'Adult' : 'Pediatric'}</div>
+                  {s.key==='adult_vecuronium' && (
+                    <div className="text-xs text-gray-700 mt-0.5">10 mg + NS→10 mL</div>
+                  )}
                 </div>
@@
               <div className="mt-2 text-sm text-gray-700">
                 Final concentration ≈ <span className="font-medium">{concDisplay}</span>
               </div>
@@
                   <div className="mt-2 flex items-center gap-2 text-sm">
                     <label className="whitespace-nowrap">Dose:</label>
                     <input
                       type="number" inputMode="decimal" className="w-28 rounded border px-2 py-1 bg-white"
-                      value={doseStr} onChange={e => setDoseStr(e.target.value)}
+                      value={doseStr} onChange={e => setDoseMap(prev=>({ ...prev, [s.key]: e.target.value }))}
                     />
                     <span className="text-gray-600">{s.doseConfig.unitPerKg}/kg</span>
-
-                    {/* Quick chips */}
-                    <div className="flex gap-1 ml-2">
-                      {typeof low==='number' && (
-                        <button className="rounded-full border px-2 py-0.5 text-xs" onClick={()=>setDoseStr(String(low))}>Low</button>
-                      )}
-                      {typeof typical==='number' && (
-                        <button className="rounded-full border px-2 py-0.5 text-xs" onClick={()=>setDoseStr(String(typical))}>Typical</button>
-                      )}
-                      {typeof high==='number' && (
-                        <button className="rounded-full border px-2 py-0.5 text-xs" onClick={()=>setDoseStr(String(high))}>High</button>
-                      )}
-                    </div>
+                  </div>
+                  {range && (
+                    <div className="mt-1 text-xs text-gray-600">
+                      Standard range: {low ?? typical}–{high ?? typical} {s.doseConfig.unitPerKg}/kg
+                    </div>
                   </div>
@@
-                  {['atracurium','vecuronium'].includes(primaryDrugKey) && (
+                  {['atracurium','vecuronium'].includes(primaryDrugKey) && (
                     <div className="mt-3">
                       <button
-                        className="rounded-xl border px-3 py-2 bg-blue-600 text-white"
+                        className="rounded-lg border px-2 py-1 text-sm bg-blue-600 text-white"
                         onClick={() => triggerRelaxantGive(primaryDrugKey as any)}
                         disabled={mlToGive==null}
                       >
-                        Give now & start/refresh Relaxant Timer
+                        Give & start timer
                       </button>
                     </div>
                   )}
                 </div>
               )}
             </article>
           )
         })}
       </div>
     </section>
   )
 }

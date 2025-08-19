@@
-import React from 'react'
+import React from 'react'
 import { RELAXANT_EVENT, RELAXANT_DEFAULT_MINUTES, type RelaxantDrug, triggerRelaxantGive } from '../lib/relaxant'
@@
 export default function Timer() {
-  const [state, setState] = React.useState<State>({ running: false, phase: 'bolus' })
+  const [state, setState] = React.useState<State>({ running: false, phase: 'bolus' })
+  const [now, setNow] = React.useState<number>(() => Date.now())
+
+  // tick so the clock moves
+  React.useEffect(() => {
+    const id = setInterval(() => setNow(Date.now()), 500)
+    return () => clearInterval(id)
+  }, [])
@@
-  const now = Date.now()
   const elapsed = state.startedAt ? now - state.startedAt : 0
   const toDue = state.dueAt ? state.dueAt - now : 0
   const pct = state.dueAt ? Math.min(100, Math.max(0, (elapsed / (state.dueAt - (state.startedAt ?? now))) * 100)) : 0
@@
   if (!state.running) {
     return (
       <section className="rounded-2xl border bg-white p-3 shadow-sm">
         <h2 className="text-base font-semibold">Relaxant Timer</h2>
-        <p className="text-sm text-gray-600 mt-1">Press <em>Give</em> on Atracurium or Vecuronium to start. You can also trigger top-ups here.</p>
+        <p className="text-sm text-gray-600 mt-1">Start here or press <em>Give</em> on the syringe card.</p>
+        <div className="mt-2 flex gap-2">
+          <button className="rounded-lg border px-2 py-1 text-sm bg-white" onClick={()=>triggerRelaxantGive('atracurium')}>Start Atracurium</button>
+          <button className="rounded-lg border px-2 py-1 text-sm bg-white" onClick={()=>triggerRelaxantGive('vecuronium')}>Start Vecuronium</button>
+        </div>
       </section>
     )
   }
@@
-      <div className="mt-3 flex gap-2">
+      <div className="mt-3 flex gap-2">
         <button
-          className="rounded-xl border px-3 py-2 bg-blue-600 text-white"
+          className="rounded-lg border px-2 py-1 text-sm bg-blue-600 text-white"
           onClick={() => state.drug && triggerRelaxantGive(state.drug)}
         >
-          Top up now & Restart
+          Top up now & Restart
         </button>
         <button
-          className="rounded-xl border px-3 py-2"
+          className="rounded-lg border px-2 py-1 text-sm"
           onClick={() => setState({ running: false, phase: 'bolus' })}
         >
           Remove
         </button>
       </div>

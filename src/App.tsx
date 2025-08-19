@@
 export default function App() {
   return (
-    <main className="w-full max-w-full mx-0 px-1 sm:px-2 md:px-3">
+    <main className="w-full max-w-full mx-0 px-0">
       <div className="grid grid-cols-1 gap-3 my-3">
         <PatientCard />
         <Timer />
         <SyringeCards />
       </div>
@@
       <footer className="px-1 sm:px-2 md:px-3 pb-6">
         <p className="text-[12px] leading-snug text-gray-600">
           For trained anesthesia professionals. Verify local vial strengths & protocols. Use clinical judgment and monitoring at all times.
         </p>
       </footer>
     </main>
   )
 }

import React from 'react'
import { Brain, TimerReset, Syringe } from 'lucide-react'

import Timer from '@/components/Timer'
import InstallPrompt from '@/components/InstallPrompt'
import LocalAnestheticCalc from '@/components/LocalAnestheticCalc'
import PatientCard from '@/components/PatientCard'
import RelaxantTimers from '@/components/RelaxantTimers'
import QuickInfo from '@/components/QuickInfo'
import { DrugDoseCards } from '@/components/DrugDoseCards'
import { SyringeCards } from '@/components/SyringeCards'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-3xl">
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 grid place-items-center text-white shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-tight">Anesthetist App (PWA)</h1>
              <p className="text-xs text-gray-500 -mt-0.5">Offline-ready • Add to Home Screen</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <a
                href="/legacy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border rounded-xl hover:bg-gray-50"
                title="Open your original Toolkit (static HTML)"
              >
                Open Legacy Toolkit
              </a>
              <InstallPrompt />
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT =====
         Tight gutters on phones; width cap only on large screens */}
      <main className="flex-1 mx-auto px-2 sm:px-3 md:px-4 lg:px-6 max-w-none lg:max-w-3xl w-full">
        <section className="py-3 sm:py-4">
          <div className="grid gap-4">
            {/* Patient summary */}
            <PatientCard />

            {/* Quick Info (sizes, fluids, EBV) */}
            <QuickInfo />

            {/* Surgical Timer */}
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-4 border-b flex items-center gap-2">
                <TimerReset className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold">Surgical Timer</h2>
              </div>
              <div className="p-4">
                <Timer />
              </div>
            </div>

            {/* Relaxant Timers */}
            <RelaxantTimers />

            {/* Drug dose & Syringe cards */}
            <DrugDoseCards />
            <SyringeCards />

            {/* Local anesthetic calculator */}
            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-4 border-b flex items-center gap-2">
                <Syringe className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold">Local Anesthetic — Max Dose</h2>
              </div>
              <div className="p-4">
                <LocalAnestheticCalc />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t bg-white">
        <div className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 text-xs text-gray-500 max-w-3xl">
          v0.3 • Data is stored locally on your device. Use clinical judgement & local policy.
        </div>
      </footer>
    </div>
  )
}

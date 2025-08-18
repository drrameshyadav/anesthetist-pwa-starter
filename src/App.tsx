import React from 'react'
import { Brain, TimerReset, Syringe } from 'lucide-react'
import Timer from './components/Timer'
import InstallPrompt from './components/InstallPrompt'
import LocalAnestheticCalc from './components/LocalAnestheticCalc'
import PatientCard from './components/PatientCard'
import RelaxantTimers from './components/RelaxantTimers'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 grid place-items-center text-white">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Anesthetist App (PWA)</h1>
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
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto p-4">
          <div className="grid gap-4">
            <PatientCard />

            <div className="rounded-2xl border bg-white shadow-sm">
              <div className="p-4 border-b flex items-center gap-2">
                <TimerReset className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold">Surgical Timer</h2>
              </div>
              <div className="p-4">
                <Timer />
              </div>
            </div>

            <RelaxantTimers />

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

      <footer className="border-t bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3 text-xs text-gray-500">
          v0.2 • Data is stored locally on your device.
        </div>
      </footer>
    </div>
  )
}

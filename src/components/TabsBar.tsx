import React from 'react'

export type TabKey =
  | 'home'
  | 'syringes'
  | 'timer'
  | 'doses'
  | 'ett'
  | 'la'
  | 'fluids'
  | 'mac'

export default function TabsBar({
  current,
  setCurrent,
}: { current: TabKey; setCurrent: (k: TabKey) => void }) {
  const Item = ({ k, label }: { k: TabKey; label: string }) => (
    <button
      onClick={() => setCurrent(k)}
      className={`px-3 py-2 text-sm whitespace-nowrap ${
        current === k ? 'font-semibold underline' : 'opacity-80'
      }`}
      aria-current={current === k}
    >
      {label}
    </button>
  )
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200" role="tablist" aria-label="Main sections">
      <div className="flex gap-1 overflow-x-auto no-scrollbar px-2">
        <Item k="home" label="Home" />
        <Item k="syringes" label="Syringes" />
        <Item k="timer" label="Relaxant Timer" />
        <Item k="doses" label="Drug doses" />
        <Item k="ett" label="ETT" />
        <Item k="la" label="Local anesthetics" />
        <Item k="fluids" label="Fluids / EBV" />
        <Item k="mac" label="Volatile MAC" />
      </div>
    </nav>
  )
}

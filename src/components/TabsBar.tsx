import React from 'react'

type TabKey = 'home' | 'syringes' | 'timer'

export default function TabsBar({ current, setCurrent }: { current: TabKey, setCurrent: (k: TabKey)=>void }) {
  const Item = ({ k, label }: { k: TabKey, label: string }) => (
    <button
      onClick={() => setCurrent(k)}
      className={`flex-1 py-2 text-sm ${current===k? 'font-semibold underline' : 'opacity-70'}`}
      aria-current={current===k}
    >{label}</button>
  )
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex gap-1 px-2">
      <Item k="home" label="Home" />
      <Item k="syringes" label="Syringes" />
      <Item k="timer" label="Relaxant Timer" />
    </nav>
  )
}

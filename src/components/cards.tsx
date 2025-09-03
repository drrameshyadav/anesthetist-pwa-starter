import * as React from 'react'
import type { CardData } from '../types'

export default function Card({ title, description, icon }: CardData) {
  return (
    <div className="ring-1 ring-gray-200 rounded-xl p-3 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2">
        {icon ? <span aria-hidden className="shrink-0">{icon}</span> : null}
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-gray-600">{description}</div>
        </div>
      </div>
    </div>
  )
}

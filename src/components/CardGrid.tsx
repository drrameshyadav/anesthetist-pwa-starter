import { cards } from '../data/cards'
import { Card } from './Card'

export function CardGrid() {
  return (
    <div className="px-2 sm:px-4 md:px-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index} {...card} />
      ))}
    </div>
  )
}
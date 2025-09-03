import { Syringe, Activity, Gauge, Stethoscope } from 'lucide-react'
import type { CardData } from '../types'

const cards: CardData[] = [
  { title: 'Drug Dosage', description: 'Weight-based calculators', icon: <Syringe className="w-5 h-5" /> },
  { title: 'Hemodynamics', description: 'MAP / HR basics',         icon: <Activity className="w-5 h-5" /> },
  { title: 'Fluids',       description: 'Maintenance & deficits',  icon: <Gauge className="w-5 h-5" /> },
  { title: 'Monitoring',   description: 'SpO₂, NIBP, ETCO₂',       icon: <Stethoscope className="w-5 h-5" /> },
]

export default cards

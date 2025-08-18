export type AgentKey = 'rocuronium' | 'vecuronium' | 'atracurium' | 'cisatracurium';

export interface AgentInfo {
  key: AgentKey;
  label: string;
  concMgPerMl: number;            // typical vial/prepared concentration
  bolusMinutesDefault: number;    // default timer after intubating dose
  maintMinutesDefault: number;    // default timer after typical intermittent maintenance dose
  maintDoseRangeMgPerKg: [number, number]; // display only
}

export const AGENTS: Record<AgentKey, AgentInfo> = {
  rocuronium: {
    key: 'rocuronium',
    label: 'Rocuronium',
    concMgPerMl: 10,             // 10 mg/mL
    bolusMinutesDefault: 31,      // median clinical duration after 0.6 mg/kg
    maintMinutesDefault: 17,      // median after ~0.15 mg/kg
    maintDoseRangeMgPerKg: [0.1, 0.2]
  },
  vecuronium: {
    key: 'vecuronium',
    label: 'Vecuronium',
    concMgPerMl: 1,              // 1 mg/mL (reconstituted)
    bolusMinutesDefault: 30,      // ~25–40 min; use 30
    maintMinutesDefault: 12,      // ~q12–15 min for 0.01–0.015 mg/kg
    maintDoseRangeMgPerKg: [0.01, 0.015]
  },
  atracurium: {
    key: 'atracurium',
    label: 'Atracurium',
    concMgPerMl: 10,             // 10 mg/mL
    bolusMinutesDefault: 40,      // ~40–45 min
    maintMinutesDefault: 20,      // first redose often 20–45 min; use 20
    maintDoseRangeMgPerKg: [0.08, 0.1]
  },
  cisatracurium: {
    key: 'cisatracurium',
    label: 'Cisatracurium',
    concMgPerMl: 2,              // 2 mg/mL
    bolusMinutesDefault: 60,      // ~55–65 min
    maintMinutesDefault: 20,      // ~20 min after 0.03 mg/kg
    maintDoseRangeMgPerKg: [0.02, 0.03]
  }
};

export type ToolId = string;

export interface ComplexityLevel {
  creditsPerSessionMin: number;
  creditsPerSessionMax: number;
}

export interface PersonaComplexity {
  low: ComplexityLevel;
  medium: ComplexityLevel;
  high: ComplexityLevel;
  veryHigh: ComplexityLevel;
}

export interface Persona {
  id: string;
  name: string;
  icon: string;
  bullets: string[];
  complexity: PersonaComplexity;
}

export interface EstimateRow {
  id: string;
  personaId: string;
  complexityLevel: ComplexityKey;
  userCount: number;
  sessionsPerDay: number;
}

export type ComplexityKey = keyof PersonaComplexity;

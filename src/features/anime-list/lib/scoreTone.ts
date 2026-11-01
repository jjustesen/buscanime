/** Faixa de cor da nota: `low` (< 50, vermelho), `mid` (50 a 80, amarelo), `high` (> 80, verde). */
export type ScoreTone = 'low' | 'mid' | 'high'

// Regra do enunciado. O Figma pinta 80 de verde, mas o enunciado manda amarelo
// (DECISIONS.md, "Fidelidade ao Figma").
export function scoreTone(score: number): ScoreTone {
  if (score < 50) return 'low'
  if (score <= 80) return 'mid'
  return 'high'
}

/** Faixa de cor da nota: `low` vermelho, `mid` amarelo, `high` verde. Limites em `scoreTone`. */
export type ScoreTone = 'low' | 'mid' | 'high'

/**
 * Faixa de cor de uma nota, pela regra do enunciado: abaixo de 50 é `low`, de 50 a 80
 * é `mid` e acima de 80 é `high`. O Figma pinta 80 de verde, mas o enunciado manda
 * amarelo (DECISIONS.md, "Fidelidade ao Figma").
 */
export function scoreTone(score: number): ScoreTone {
  if (score < 50) return 'low'
  if (score <= 80) return 'mid'
  return 'high'
}

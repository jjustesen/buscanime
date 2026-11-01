/** Qualquer item com um `id` numérico, como o `Anime`. */
export interface WithId {
  /** Identificador único do item. */
  id: number
}

// Tira os itens com `id` repetido e mantém a primeira vez que cada um aparece, na ordem.
export function uniqueById<T extends WithId>(items: T[]): T[] {
  const seen = new Set<number>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

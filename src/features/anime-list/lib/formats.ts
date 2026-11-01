import type { Format } from '../../../api/types'

/** Valor de um botão de formato: `ALL` (sem filtro) ou um formato da AniList. */
export type FormatFilter = 'ALL' | Format

/** Um botão de formato, com o texto exato do Figma. */
export interface FormatOption {
  /** Valor enviado ao escolher o botão. */
  value: FormatFilter
  /** Texto do botão, idêntico ao Figma. */
  label: string
}

// Na ordem dos botões do Figma.
export const FORMAT_OPTIONS = [
  { value: 'ALL', label: 'All Formats' },
  { value: 'TV', label: 'TV Show' },
  { value: 'MOVIE', label: 'Movie' },
  { value: 'TV_SHORT', label: 'TV Short' },
  { value: 'SPECIAL', label: 'Special' },
  { value: 'OVA', label: 'OVA' },
  { value: 'ONA', label: 'ONA' },
  { value: 'MUSIC', label: 'Music' },
] as const satisfies readonly FormatOption[]

// Confere um valor vindo de fora (a URL) antes de usá-lo como filtro.
export function isFormatFilter(value: string | null): value is FormatFilter {
  return FORMAT_OPTIONS.some((option) => option.value === value)
}

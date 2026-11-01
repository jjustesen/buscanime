import type { Anime, Format } from '../../api/types'
import amberCover from './covers/amber.svg'
import purpleCover from './covers/purple.svg'
import tealCover from './covers/teal.svg'

/** Anime das fixtures com o formato, que o `Anime` não guarda mas o mock usa para filtrar. */
export interface AnimeFixture {
  /** Anime já no formato da tela, igual ao que o `fetchAnimePage` devolve. */
  anime: Anime
  /** Formato da AniList, usado pelo handler do MSW no filtro. */
  format: Format
}

// Capas locais: os testes e as stories não dependem da internet. Um SVG vale para os
// dois tamanhos do `srcset`.
const COVERS = [
  { url: purpleCover, color: '#774dc5' },
  { url: tealCover, color: '#01ada6' },
  { url: amberCover, color: '#e4a400' },
]

function makeAnime(
  id: number,
  title: string,
  averageScore: number | null,
  genres: string[],
): Anime {
  const cover = COVERS[id % COVERS.length]
  return {
    id,
    title,
    cover: { medium: cover.url, large: cover.url, color: cover.color },
    genres,
    averageScore,
  }
}

// Animes com nome, para as stories de cada estado do card.
export const animeHighScore = makeAnime(1, 'Hoshi no Kaze', 87, ['Action', 'Adventure', 'Fantasy'])
export const animeMidScore = makeAnime(2, 'Kumo no Ue no Toshokan', 80, ['Drama', 'Romance'])
export const animeLowScore = makeAnime(3, 'Ganbare Robo-kun', 48, ['Comedy', 'Mecha'])
export const animeNoScore = makeAnime(4, 'Shin Sekai Hen', null, ['Sci-Fi', 'Mystery', 'Thriller'])
export const animeLongTitle = makeAnime(
  5,
  'Tensei shitara Mori no Kuma datta Ken: Sekai de Ichiban Nagai Taitoru no Monogatari to Sono Tsuzuki',
  72,
  ['Fantasy', 'Action', 'Comedy'],
)
export const animeNoGenres = makeAnime(6, 'Mujin Eki', 65, [])
// Fora da lista paginada: a imagem não existe, então o card mostra só a cor de fundo.
export const animeBrokenImage: Anime = {
  id: 900,
  title: 'Kowareta Gazou',
  cover: { medium: '/missing-cover.jpg', large: '/missing-cover.jpg', color: '#e46b50' },
  genres: ['Horror'],
  averageScore: 55,
}

// 24 animes (2 páginas de 12) com formatos misturados, na ordem em que o mock responde.
// TV: 10, MOVIE: 5, OVA: 3, ONA: 2, SPECIAL: 2, TV_SHORT: 1, MUSIC: 1.
export const animeFixtures: AnimeFixture[] = [
  { anime: animeHighScore, format: 'TV' },
  { anime: animeMidScore, format: 'MOVIE' },
  { anime: animeLowScore, format: 'OVA' },
  { anime: animeNoScore, format: 'TV' },
  { anime: animeLongTitle, format: 'TV' },
  { anime: animeNoGenres, format: 'SPECIAL' },
  { anime: makeAnime(7, 'Kaminari Gakuen', 83, ['Action', 'Comedy']), format: 'TV' },
  { anime: makeAnime(8, 'Yoru no Densha', 91, ['Drama', 'Slice of Life']), format: 'MOVIE' },
  { anime: makeAnime(9, 'Neko Kissa Days', 70, ['Comedy', 'Slice of Life']), format: 'ONA' },
  { anime: makeAnime(10, 'Tetsu no Tsubasa', 76, ['Mecha', 'Sci-Fi', 'Drama']), format: 'TV' },
  { anime: makeAnime(11, 'Mini Mini Ninja', 61, ['Comedy']), format: 'TV_SHORT' },
  { anime: makeAnime(12, 'Akai Tsuki', 85, ['Horror', 'Mystery', 'Psychological']), format: 'TV' },
  { anime: makeAnime(13, 'Hoshi no Kaze: Gekijouban', 82, ['Action', 'Fantasy']), format: 'MOVIE' },
  { anime: makeAnime(14, 'Umi to Sora', 79, ['Romance', 'Drama']), format: 'TV' },
  { anime: makeAnime(15, 'Kage no Kishi', 45, ['Action', 'Fantasy']), format: 'OVA' },
  { anime: makeAnime(16, 'Utau Machi', 68, ['Music']), format: 'MUSIC' },
  { anime: makeAnime(17, 'Ryouri Ou', 74, ['Comedy', 'Slice of Life']), format: 'TV' },
  { anime: makeAnime(18, 'Natsu Matsuri Tokubetsuhen', 58, ['Slice of Life']), format: 'SPECIAL' },
  { anime: makeAnime(19, 'Denshi no Yume', 63, ['Sci-Fi', 'Psychological']), format: 'ONA' },
  { anime: makeAnime(20, 'Hoshi Kuzushi', 88, ['Action', 'Sci-Fi', 'Drama']), format: 'TV' },
  { anime: makeAnime(21, 'Shiroi Inu no Tabi', 81, ['Adventure', 'Drama']), format: 'MOVIE' },
  { anime: makeAnime(22, 'Sakura Koukou Bukatsu', 50, ['Comedy', 'Sports']), format: 'TV' },
  { anime: makeAnime(23, 'Mahou Shoujo Rina', 39, ['Fantasy', 'Mahou Shoujo']), format: 'OVA' },
  { anime: makeAnime(24, 'Saigo no Ressha', 77, ['Thriller', 'Drama']), format: 'MOVIE' },
]

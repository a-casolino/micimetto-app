/**
 * Integrazione con Bunny Stream (https://docs.bunny.net/reference/video_getvideo).
 *
 * Variabili d'ambiente:
 * - BUNNY_STREAM_LIBRARY_ID   ID numerico della libreria video (Stream → libreria → API)
 * - BUNNY_STREAM_API_KEY      chiave API della libreria (solo server, mai nel browser)
 * - BUNNY_STREAM_CDN_HOSTNAME hostname CDN della libreria, es. vz-xxxx.b-cdn.net (per le anteprime)
 */

export type BunnyConfig = {
  libraryId: string
  apiKey?: string
  cdnHostname?: string
}

export function bunnyConfig(): BunnyConfig | null {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID
  if (!libraryId) return null
  return {
    libraryId,
    apiKey: process.env.BUNNY_STREAM_API_KEY || undefined,
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME || undefined,
  }
}

/** Stati di codifica restituiti dall'API (campo `status`). */
export const STATI_BUNNY = {
  0: 'creato',
  1: 'caricato',
  2: 'in-elaborazione',
  3: 'in-codifica',
  4: 'pronto',
  5: 'errore',
  6: 'caricamento-fallito',
} as const

export type StatoBunny = (typeof STATI_BUNNY)[keyof typeof STATI_BUNNY]

export const statoOptions = Object.values(STATI_BUNNY).map((value) => ({
  value,
  label: value.replace(/-/g, ' '),
}))

export type BunnyVideo = {
  guid: string
  title: string
  length: number
  status: keyof typeof STATI_BUNNY
  width: number
  height: number
  thumbnailFileName?: string | null
}

export class BunnyNotFound extends Error {}

export async function fetchBunnyVideo(
  config: BunnyConfig,
  videoId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<BunnyVideo> {
  if (!config.apiKey) throw new Error('BUNNY_STREAM_API_KEY non impostata')
  const res = await fetchImpl(
    `https://video.bunnycdn.com/library/${encodeURIComponent(config.libraryId)}/videos/${encodeURIComponent(videoId)}`,
    { headers: { AccessKey: config.apiKey, accept: 'application/json' }, cache: 'no-store' },
  )
  if (res.status === 404) throw new BunnyNotFound(videoId)
  if (!res.ok) throw new Error(`Bunny Stream ha risposto ${res.status}`)
  return (await res.json()) as BunnyVideo
}

/** URL del player da usare in un iframe. */
export function bunnyEmbedUrl(
  libraryId: string,
  videoId: string,
  opzioni: { autoplay?: boolean; muted?: boolean; loop?: boolean; preload?: boolean } = {},
): string {
  const params = new URLSearchParams({
    autoplay: String(opzioni.autoplay ?? false),
    muted: String(opzioni.muted ?? false),
    loop: String(opzioni.loop ?? false),
    preload: String(opzioni.preload ?? false),
    responsive: 'true',
  })
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?${params}`
}

export function bunnyThumbnailUrl(
  cdnHostname: string,
  videoId: string,
  thumbnailFileName = 'thumbnail.jpg',
): string {
  return `https://${cdnHostname}/${videoId}/${thumbnailFileName}`
}
